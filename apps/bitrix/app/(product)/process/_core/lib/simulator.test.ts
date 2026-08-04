/**
 * Тесты симулятора. Он повторяет правила бэкенда, а значит обязан вести себя
 * так же: лестницу нельзя понизить, «Продажа» закрывает сделку, перенос не
 * плодит задачи, а постпродажная «Поставка» не портит статистику.
 */

import { describe, expect, it } from 'vitest';
import { SALES_PROCESS } from '../constants/sales-process';
import { satelliteStates } from './satellites.util';
import { setSimWorkplace } from './simulator.util';
import {
    isSetAsideDeadline,
    SIM_ARRIVING_EVENTS,
    SIM_PICKABLE_WORK_STATUSES,
    SIM_PLANNABLE_EVENTS,
    visibleWorkStatuses,
} from '../constants/sim-events';
import { SIM_EVENT_TYPES } from '../constants/sim-events';
import { deriveProcessModel } from './coverage';
import {
    addSimTask,
    applyReport,
    createSimState,
    firstHumanStageIndex,
    openSimTask,
} from './simulator.util';
import type { SimReport, SimState } from './simulator.util';

const model = deriveProcessModel(SALES_PROCESS, {
    leadPct: 15,
    dealPct: 90,
    answers: {},
});

const stageIndex = (id: string) =>
    SALES_PROCESS.stages.findIndex(stage => stage.id === id);

const report = (patch: Partial<SimReport> = {}): SimReport => ({
    result: 'result',
    comment: '',
    workStatus: 'inJob',
    presentationDone: false,
    reportContactId: null,
    nextEventCode: null,
    planContactId: null,
    ...patch,
});

const run = (state: SimState, patch: Partial<SimReport> = {}) =>
    applyReport({
        state,
        report: report(patch),
        definition: SALES_PROCESS,
        model,
        entryId: 'test',
    });

/** Состояние «менеджер открыл единственное дело и отчитывается по нему». */
const at = (stageId: string, plannedEventCode: string) => {
    const state = createSimState(
        'lead',
        'ООО «Тест»',
        stageIndex(stageId),
        plannedEventCode,
    );
    return openSimTask(state, state.tasks[0]!.id);
};

const lastActions = (state: SimState) => state.log.at(-1)!.systemActions;

describe('типы событий', () => {
    it('каждый ведёт на существующую стадию', () => {
        const ids = new Set(SALES_PROCESS.stages.map(stage => stage.id));
        SIM_EVENT_TYPES.forEach(event => {
            expect(ids.has(event.targetStageId), event.code).toBe(true);
        });
    });

    it('порядок событий не убывает — это и есть лестница', () => {
        const orders = SIM_EVENT_TYPES.map(event => event.order);
        expect(orders).toEqual([...orders].sort((a, b) => a - b));
    });

    it('события одной ступени ведут на одну стадию', () => {
        // «Холодный звонок» и «Холодный звонок · заявка» — одна ступень:
        // разговор начинается по-разному, но сделка встаёт туда же.
        const byOrder = new Map<number, Set<string>>();
        SIM_EVENT_TYPES.forEach(event => {
            const stages = byOrder.get(event.order) ?? new Set<string>();
            stages.add(event.targetStageId);
            byOrder.set(event.order, stages);
        });

        byOrder.forEach((stages, order) => {
            expect(stages.size, `ступень ${order}`).toBe(1);
        });
    });

    it('у «Документов» и «Поставки» записи KPI нет', () => {
        const byCode = Object.fromEntries(
            SIM_EVENT_TYPES.map(event => [event.code, event.writesKpi]),
        );
        expect(byCode.document).toBe(false);
        expect(byCode.supply).toBe(false);
        expect(byCode.presentation).toBe(true);
    });
});

describe('старт', () => {
    it('начинается с первой стадии, где работает человек', () => {
        const index = firstHumanStageIndex(model);
        expect(model.stages[index]?.actor).not.toBe('sys');
    });

    it('вход проходим: «Новую» разбирает администратор, а не автоматика', () => {
        // Пока вход вёл 'sys', роль администратора нельзя было пройти вообще —
        // симулятор перепрыгивал через неё на «Холодные».
        expect(firstHumanStageIndex(model)).toBe(0);
        expect(model.stages[0]?.actor).toBe('adm');
    });
});

describe('движение по лестнице', () => {
    it('план следующего события поднимает сделку', () => {
        const next = run(at('sales_cold', 'cold'), {
            nextEventCode: 'presentation',
        });

        expect(next.stageIndex).toBe(stageIndex('sales_pres'));
        expect(next.tasks.map(task => task.eventCode)).toEqual([
            'presentation',
        ]);
    });

    it('понизить стадию нельзя', () => {
        const next = run(at('sales_money_await', 'moneyAwait'), {
            nextEventCode: 'warm',
        });

        expect(next.stageIndex).toBe(stageIndex('sales_money_await'));
        expect(lastActions(next)).toContain(
            'Стадия сделки не изменилась — понизить её нельзя.',
        );
    });

    it('нерезультативный отчёт стадию не двигает', () => {
        const next = run(at('sales_cold', 'cold'), {
            result: 'noresult',
            noresultReason: 'nopickup',
            nextEventCode: 'cold',
        });

        expect(next.stageIndex).toBe(stageIndex('sales_cold'));
    });
});

describe('задачи', () => {
    it('перенос двигает дедлайн и НЕ создаёт новую задачу', () => {
        const actions = lastActions(
            run(at('sales_warm', 'warm'), {
                result: 'noresult',
                noresultReason: 'nocontact',
                nextEventCode: 'warm',
            }),
        );

        expect(actions).toContain(
            'Дедлайн текущей задачи перенесён. Новая задача НЕ создаётся.',
        );
        expect(actions.some(item => item.startsWith('Создана задача'))).toBe(
            false,
        );
    });

    it('результативный отчёт закрывает задачу и заводит следующую', () => {
        const actions = lastActions(
            run(at('sales_warm', 'warm'), { nextEventCode: 'presentation' }),
        );

        expect(actions).toContain('Текущая задача закрыта.');
        expect(
            actions.some(item => item.includes('Создана задача «Презентация»')),
        ).toBe(true);
        // Важное событие получает высокий приоритет — как в заголовке задачи.
        expect(actions.some(item => item.includes('высоким приоритетом'))).toBe(
            true,
        );
    });

    it('название задачи — то, что написал менеджер; тип идёт отдельно', () => {
        const actions = lastActions(
            run(at('sales_warm', 'warm'), {
                nextEventCode: 'presentation',
                planTitle: 'Показать расчёт директору',
                planDeadline: 'пятница, 15:00',
            }),
        );

        expect(
            actions.some(
                item =>
                    item.includes('«Показать расчёт директору»') &&
                    item.includes('с типом «Презентация»') &&
                    item.includes('пятница, 15:00'),
            ),
        ).toBe(true);
    });

    it('планирование презентации пишет отдельную запись KPI', () => {
        const next = run(at('sales_warm', 'warm'), {
            nextEventCode: 'presentation',
        });
        const labels = next.log.at(-1)!.kpi.map(record => record.label);

        expect(labels).toContain('Презентация запланирована');
        expect(labels).not.toContain('Презентация проведена');
    });

    it('проведённая презентация пишет свою запись, отдельно от плана', () => {
        const next = run(at('sales_pres', 'presentation'), {
            presentationDone: true,
            nextEventCode: 'hot',
        });
        const labels = next.log.at(-1)!.kpi.map(record => record.label);

        expect(labels).toContain('Презентация проведена');
        expect(labels).not.toContain('Презентация запланирована');
    });

    it('комментарий не выбрасывается — он уходит в несколько мест', () => {
        const actions = lastActions(
            run(at('sales_warm', 'warm'), {
                comment: 'Договорились о встрече во вторник',
                nextEventCode: 'presentation',
            }),
        );

        expect(
            actions.some(item =>
                item.includes('Договорились о встрече во вторник'),
            ),
        ).toBe(true);
    });
});

describe('исходы', () => {
    it('продажа закрывает сделку и переводит её в «Успех»', () => {
        const next = run(at('sales_money_await', 'moneyAwait'), {
            workStatus: 'success',
        });

        expect(next.status).toBe('sale');
        expect(next.stageIndex).toBe(stageIndex('sales_success'));
        expect(next.tasks).toHaveLength(0);
        expect(
            lastActions(next).some(item => item.includes('больше не видят')),
        ).toBe(true);
    });

    it('отказ уводит компанию в буфер отказников', () => {
        const next = run(at('sales_pres', 'presentation'), {
            workStatus: 'fail',
        });

        expect(next.status).toBe('fail');
        expect(next.tasks).toHaveLength(0);
        expect(
            lastActions(next).some(item => item.includes('буфер отказников')),
        ).toBe(true);
    });
});

describe('постпродажная «Поставка» не портит статистику', () => {
    it('по ней не пишется запись KPI', () => {
        const actions = lastActions(
            run(at('sales_supply', 'supply'), { nextEventCode: null }),
        );

        expect(actions.some(item => item.includes('записи KPI нет'))).toBe(
            true,
        );
        expect(
            actions.some(item => item.includes('«ОП KPI» и «ОП История')),
        ).toBe(false);
    });
});

describe('презентация', () => {
    it('незапланированная заводит отдельную сделку-спутник', () => {
        const actions = lastActions(
            run(at('sales_warm', 'warm'), {
                presentationDone: true,
                nextEventCode: 'hot',
            }),
        );

        expect(actions.some(item => item.includes('«ОП Презентации»'))).toBe(
            true,
        );
    });
});

describe('синхронизация статусов лида', () => {
    it('упоминается только когда включена и лид в работе', () => {
        const withSync = deriveProcessModel(SALES_PROCESS, {
            leadPct: 100,
            dealPct: 100,
            answers: { 'lead-status-auto': 'on' },
        });

        const actions = applyReport({
            state: at('sales_warm', 'warm'),
            report: report({ nextEventCode: 'presentation' }),
            definition: SALES_PROCESS,
            model: withSync,
            entryId: 'sync',
        }).log.at(-1)!.systemActions;

        expect(
            actions.some(item => item.includes('Статус связанного лида')),
        ).toBe(true);
        // При «Админ + Сделка» лида в работе нет — и упоминания быть не должно.
        expect(
            lastActions(run(at('sales_warm', 'warm'))).some(item =>
                item.includes('Статус связанного лида'),
            ),
        ).toBe(false);
    });
});

describe('весь путь до продажи', () => {
    it('проходится шагами и копит историю', () => {
        // После каждой отправки менеджер оказывается в списке дел, поэтому
        // следующее дело нужно открыть — ровно как в приложении.
        const next = (s: SimState, patch: Partial<SimReport>) =>
            run(openSimTask(s, s.tasks[0]!.id), patch);

        let state = at('sales_cold', 'cold');
        state = run(state, { nextEventCode: 'warm' });
        state = next(state, { nextEventCode: 'presentation' });
        state = next(state, { presentationDone: true, nextEventCode: 'hot' });
        state = next(state, { nextEventCode: 'moneyAwait' });
        state = next(state, { workStatus: 'success' });

        expect(state.status).toBe('sale');
        expect(state.log).toHaveLength(5);
        expect(state.stageIndex).toBe(stageIndex('sales_success'));
    });
});

describe('список дел', () => {
    it('после отправки менеджер возвращается в список, а не в форму', () => {
        const next = run(at('sales_warm', 'warm'), {
            nextEventCode: 'presentation',
        });

        expect(next.activeTaskId).toBeNull();
        expect(next.tasks).toHaveLength(1);
    });

    it('отработанное дело уходит из списка', () => {
        const next = run(at('sales_warm', 'warm'), { nextEventCode: 'hot' });

        expect(next.tasks.map(task => task.eventCode)).toEqual(['hot']);
    });

    it('перенос оставляет то же дело: задача одна, сдвинулся дедлайн', () => {
        const state = at('sales_warm', 'warm');
        const next = run(state, {
            result: 'noresult',
            noresultReason: 'nopickup',
            nextEventCode: 'warm',
        });

        expect(next.tasks).toHaveLength(1);
        expect(next.tasks[0]!.id).toBe(state.tasks[0]!.id);
    });

    it('дел может быть несколько сразу, и каждое двигает стадию', () => {
        // Планирование само поднимает сделку — в калькуляторе planEventType
        // равноправный кандидат с отчётом.
        let state = createSimState('lead', 'ООО «Тест»', 1, 'warm');
        state = addSimTask(state, 'presentation', SALES_PROCESS);

        expect(state.tasks).toHaveLength(2);
        expect(state.stageIndex).toBe(stageIndex('sales_pres'));
    });

    it('планирование не может понизить стадию', () => {
        let state = createSimState(
            'lead',
            'ООО «Тест»',
            stageIndex('sales_money_await'),
            'moneyAwait',
        );
        state = addSimTask(state, 'warm', SALES_PROCESS);

        expect(state.stageIndex).toBe(stageIndex('sales_money_await'));
    });
});

describe('что менеджер может запланировать сам', () => {
    it('холодного звонка в списке планирования нет — его ставит хук', () => {
        const codes = SIM_PLANNABLE_EVENTS.map(event => event.code);

        expect(codes).not.toContain('cold');
        expect(codes).not.toContain('coldLead');
    });

    it('список совпадает с PLAN_CALL_TYPES реального приложения', () => {
        // apps/event-sales/modules/entities/EventPlan/lib/plan-util.ts
        expect(SIM_PLANNABLE_EVENTS.map(event => event.code)).toEqual([
            'warm',
            'presentation',
            'hot',
            'moneyAwait',
            'supply',
        ]);
    });

    it('холодные события приходят извне и в лестнице стоят первыми', () => {
        const arriving = SIM_ARRIVING_EVENTS.map(event => event.code);

        expect(arriving).toContain('cold');
        expect(arriving).toContain('coldLead');
        // «Документы» тоже не планируются, хотя стадия такая есть.
        expect(arriving).toContain('document');
    });
});

describe('«Отложено» наступает само', () => {
    it('менеджеру его выбрать нельзя', () => {
        expect(
            SIM_PICKABLE_WORK_STATUSES.map(status => status.code),
        ).not.toContain('setAside');
    });

    it('«Отложено» занимает место «В работе», а не добавляется к нему', () => {
        // Так же в приложении: getCurrentWorkStatusItems их взаимоисключает.
        const normal = visibleWorkStatuses(false).map(status => status.code);
        const aside = visibleWorkStatuses(true).map(status => status.code);

        expect(normal).toContain('inJob');
        expect(normal).not.toContain('setAside');
        expect(aside).toContain('setAside');
        expect(aside).not.toContain('inJob');
        expect(normal.length).toBe(aside.length);
    });

    it('срок дальше четырёх месяцев откладывает работу', () => {
        expect(isSetAsideDeadline('tomorrow')).toBe(false);
        expect(isSetAsideDeadline('quarter')).toBe(false);
        expect(isSetAsideDeadline('half')).toBe(true);
        expect(isSetAsideDeadline('year')).toBe(true);
    });
});

describe('исход закрывает все воронки, каждую по своему условию', () => {
    const sat = (state: SimState) => {
        const byId = new Map(
            satelliteStates(model.satellites, state).map(item => [
                item.satellite.id,
                item,
            ]),
        );
        return byId;
    };

    it('продажа закрывает основную и все дополнительные', () => {
        const start = at('sales_money_await', 'moneyAwait');
        const sold = run(
            { ...start, tasks: start.tasks },
            {
                workStatus: 'success',
                nextEventCode: null,
            },
        );

        expect(sold.status).toBe('sale');
        sat(sold).forEach(item => {
            expect(item.isClosed, item.satellite.id).toBe(true);
        });
    });

    it('каждая воронка встаёт на СВОЮ терминальную стадию, а не на общую', () => {
        const start = at('sales_money_await', 'moneyAwait');
        const failed = run(start, {
            workStatus: 'fail',
            failType: 'failure',
            failReason: 'noneed',
            nextEventCode: null,
        });
        const byId = sat(failed);

        expect(byId.get('xo')?.stageId).toBe('cold_fail');
        expect(byId.get('tmc')?.stageId).toBe('sales_tmc_fail');
        // Суффиксы разные у каждой воронки — общей стадии «Отказ» нет.
        expect(byId.get('xo')?.stageId).not.toBe(byId.get('tmc')?.stageId);
    });

    it('пока сделка жива, спутники не закрываются скопом', () => {
        const byId = sat(at('sales_warm', 'warm'));

        expect(byId.get('tmc')?.isClosed).toBe(false);
    });

    it('сорванная презентация не выглядит проведённой', () => {
        // Встречу назначили, но не провели, и следом закрыли сделку отказом.
        const planned = run(at('sales_warm', 'warm'), {
            nextEventCode: 'presentation',
        });
        const failed = run(planned, {
            workStatus: 'fail',
            failType: 'failure',
            failReason: 'noneed',
            nextEventCode: null,
        });
        const item = sat(failed).get('presentation');

        expect(item?.isClosed).toBe(true);
        expect(item?.stageId).toBe('spres_fail');
        expect(item?.reason).toContain('не состоялись');
        expect(item?.reason).toContain('Отказ');
    });

    it('проведённая презентация закрывается своим условием, а не исходом', () => {
        const done = run(at('sales_pres', 'presentation'), {
            presentationDone: true,
            nextEventCode: 'hot',
        });
        const item = sat(done).get('presentation');

        expect(item?.stageId).toBe('spres_success');
        expect(item?.reason).toContain('все встречи прошли');
    });

    it('спутник ХО закрывается своим условием — отчётом по холодному', () => {
        const afterCold = run(at('sales_cold', 'cold'), {
            nextEventCode: 'warm',
        });
        const item = sat(afterCold).get('xo');

        expect(item?.isClosed).toBe(true);
        expect(item?.stageId).toBe('cold_success');
        expect(item?.reason).toContain('своим условием');
    });
});

describe('презентация: проведена или только разговор', () => {
    const kpiOf = (state: SimState) =>
        state.log.at(-1)!.kpi.map(record => record.label);

    it('результативный отчёт по презентации засчитывает встречу', () => {
        const next = run(at('sales_pres', 'presentation'), {
            presentationDone: true,
            nextEventCode: 'hot',
        });

        expect(kpiOf(next)).toContain('Презентация проведена');
    });

    it('отжатая «проведена» превращает отчёт в результативный звонок', () => {
        const next = run(at('sales_pres', 'presentation'), {
            presentationDone: false,
            nextEventCode: 'hot',
        });
        const labels = kpiOf(next);

        expect(labels).toContain('Звонок');
        expect(labels).not.toContain('Презентация проведена');
        expect(labels).not.toContain('Презентация');
    });

    const presentationSatellite = (state: SimState) =>
        satelliteStates(model.satellites, state).find(
            entry => entry.satellite.id === 'presentation',
        );

    it('встреча не состоялась, но шаг назначен — это ПЕРЕНОС, а не срыв', () => {
        // Так же считает бэкенд: deriveReportAction проверяет isExpired
        // РАНЬШЕ !isResult, а isExpired — это «нерезультативно и есть план».
        const next = run(at('sales_pres', 'presentation'), {
            presentationDone: false,
            nextEventCode: 'hot',
        });
        const item = presentationSatellite(next);

        expect(item?.isClosed).toBe(false);
        expect(item?.stageId).toBe('spres_pending');
        expect(item?.reason).toContain('перенесли');
    });

    it('встреча не состоялась и шага нет — «Не состоялась»', () => {
        const next = run(at('sales_pres', 'presentation'), {
            presentationDone: false,
            nextEventCode: null,
        });
        const item = presentationSatellite(next);

        expect(item?.isClosed).toBe(true);
        expect(item?.stageId).toBe('spres_noresult');
        expect(item?.reason).toContain('не состоявшихся');
    });

    it('нерезультативный отчёт по презентации с планом тоже перенос', () => {
        const next = run(at('sales_pres', 'presentation'), {
            result: 'noresult',
            presentationDone: false,
            nextEventCode: 'presentation',
        });

        expect(presentationSatellite(next)?.stageId).toBe('spres_pending');
    });

    it('нерезультативный отчёт по презентации встречу не засчитывает', () => {
        const next = run(at('sales_pres', 'presentation'), {
            result: 'noresult',
            presentationDone: false,
            nextEventCode: 'presentation',
        });

        expect(kpiOf(next)).not.toContain('Презентация проведена');
    });

    it('презентацию можно провести и сразу получить отказ', () => {
        const next = run(at('sales_pres', 'presentation'), {
            presentationDone: true,
            workStatus: 'fail',
            failType: 'failure',
            failReason: 'noneed',
            nextEventCode: null,
        });

        expect(next.status).toBe('fail');
        expect(kpiOf(next)).toContain('Презентация проведена');
    });

    it('презентация и продажа засчитываются вместе', () => {
        const next = run(at('sales_pres', 'presentation'), {
            presentationDone: true,
            workStatus: 'success',
            nextEventCode: null,
        });

        expect(next.status).toBe('sale');
        expect(kpiOf(next)).toContain('Презентация проведена');
    });
});

describe('место работы и режим менеджера', () => {
    it('по умолчанию работаем из сделки', () => {
        expect(at('sales_warm', 'warm').workplace).toBe('deal');
    });

    it('переключение места не трогает ничего, кроме места', () => {
        const start = at('sales_warm', 'warm');
        const next = setSimWorkplace(start, 'lead');

        expect(next.workplace).toBe('lead');
        expect(next.stageIndex).toBe(start.stageIndex);
        expect(next.tasks).toEqual(start.tasks);
        expect(next.log).toEqual(start.log);
    });

    it('режим менеджера выключен, пока его не включили', () => {
        expect(at('sales_warm', 'warm').isManagerMode).toBe(false);
    });
});

describe('внеплановая презентация', () => {
    const kpiOf = (state: SimState) =>
        state.log.at(-1)!.kpi.map(record => record.label);

    it('тянет сделку на «Презентацию», хотя отчитывались о звонке', () => {
        const next = run(at('sales_warm', 'warm'), {
            presentationDone: true,
            nextEventCode: 'warm',
        });

        expect(next.stageIndex).toBe(stageIndex('sales_pres'));
    });

    it('пишет ДВЕ записи разом: назначена и проведена', () => {
        const labels = kpiOf(
            run(at('sales_warm', 'warm'), {
                presentationDone: true,
                nextEventCode: 'warm',
            }),
        );

        expect(labels).toContain('Презентация запланирована');
        expect(labels).toContain('Презентация проведена');
        // Плюс само отчётное событие — звонок.
        expect(labels).toContain('Звонок');
    });

    it('запланированная презентация двигает сделку и без результата', () => {
        // Бэкенд не спрашивает про результативность: план — такой же
        // кандидат лестницы, как отчёт.
        const next = run(at('sales_warm', 'warm'), {
            result: 'noresult',
            nextEventCode: 'presentation',
        });

        expect(next.stageIndex).toBe(stageIndex('sales_pres'));
    });

    it('понизить стадию по-прежнему нельзя', () => {
        const next = run(at('sales_in_progress', 'hot'), {
            nextEventCode: 'warm',
        });

        expect(next.stageIndex).toBe(stageIndex('sales_in_progress'));
    });
});

