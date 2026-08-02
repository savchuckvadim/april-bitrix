/**
 * Тесты последствий ответов.
 *
 * Главный тест здесь — «каждый активный вопрос что-то меняет»: это правило
 * приёмки страницы. Вопрос-пустышка обесценивает весь пульт, потому что
 * заказчик перестаёт верить, что переключатели вообще работают.
 */

import { describe, expect, it } from 'vitest';
import {
    ACTIVE_SALES_QUESTIONS,
    SALES_QUESTIONS,
} from '../constants/questions';
import { SALES_PROCESS } from '../constants/sales-process';
import { deriveProcessModel } from './coverage';

const withAnswers = (answers: Record<string, string>) =>
    deriveProcessModel(SALES_PROCESS, {
        leadPct: 100,
        dealPct: 100,
        answers,
    });

const stageById = (
    model: ReturnType<typeof deriveProcessModel>,
    stageId: string,
) => model.stages.find(view => view.stage.id === stageId)!;

describe('состав вопросов', () => {
    it('у каждого активного варианта есть хотя бы один эффект', () => {
        ACTIVE_SALES_QUESTIONS.forEach(question => {
            const withEffect = question.options.filter(option => option.effect);
            expect(
                withEffect.length,
                `вопрос «${question.title}» ничего не меняет`,
            ).toBeGreaterThan(0);
        });
    });

    it('у выключенных вопросов указана причина', () => {
        SALES_QUESTIONS.filter(question => !question.isActive).forEach(
            question => {
                expect(question.inactiveReason).toBeTruthy();
            },
        );
    });

    it('коды вариантов внутри вопроса уникальны', () => {
        SALES_QUESTIONS.forEach(question => {
            const codes = question.options.map(option => option.code);
            expect(new Set(codes).size).toBe(codes.length);
        });
    });

    it('все stageId в эффектах существуют в хребте', () => {
        const ids = new Set(SALES_PROCESS.stages.map(stage => stage.id));

        SALES_QUESTIONS.flatMap(question => question.options)
            .map(option => option.effect)
            .filter(Boolean)
            .forEach(effect => {
                effect!.actorFor?.stageIds.forEach(id =>
                    expect(ids.has(id), `нет стадии ${id}`).toBe(true),
                );
                if (effect!.leadCapStageId) {
                    expect(ids.has(effect!.leadCapStageId)).toBe(true);
                }
                if (effect!.kpiFromStageId) {
                    expect(ids.has(effect!.kpiFromStageId)).toBe(true);
                }
            });
    });

    it('все exitId в эффектах существуют', () => {
        const ids = new Set(SALES_PROCESS.exits.map(exit => exit.id));

        SALES_QUESTIONS.flatMap(question => question.options)
            .map(option => option.effect)
            .filter(Boolean)
            .forEach(effect => {
                effect!.hideExitIds?.forEach(id =>
                    expect(ids.has(id), `нет съезда ${id}`).toBe(true),
                );
                effect!.actorForExit?.exitIds.forEach(id =>
                    expect(ids.has(id), `нет съезда ${id}`).toBe(true),
                );
                effect!.exitHints?.exitIds.forEach(id =>
                    expect(ids.has(id), `нет съезда ${id}`).toBe(true),
                );
            });
    });
});

describe('возвращённые вопросы', () => {
    it('«лимита нет» убирает вход «Буфер отказников»', () => {
        const ids = withAnswers({ capacity: 'none' }).entryPoints.map(
            entry => entry.id,
        );

        expect(ids).not.toContain('buffer');
        expect(withAnswers({}).entryPoints.map(e => e.id)).toContain('buffer');
    });

    it('порог «когда можно забрать» меняет подпись съезда, но не убирает его', () => {
        const hint = (answer: string) =>
            withAnswers({ 'live-deal': answer }).exits.find(
                exit => exit.id === 'handover',
            )?.hint;

        // Три варианта дают три разные подписи — иначе ответ ничего не меняет.
        const variants = ['abandoned', 'any', 'manual'].map(hint);
        expect(new Set(variants).size).toBe(3);

        expect(hint('abandoned')).toContain('5 месяцев');
        expect(hint('manual')).toContain('руководитель');
        expect(
            withAnswers({ 'live-deal': 'any' }).exits.map(exit => exit.id),
        ).toContain('handover');
    });

    it('каждый вариант «когда можно забрать» задаёт свою подсказку', () => {
        const question = SALES_QUESTIONS.find(item => item.id === 'live-deal');

        expect(question?.isActive).toBe(true);
        question?.options.forEach(option => {
            expect(
                option.effect?.exitHints?.hint,
                `у варианта «${option.label}» нет подсказки`,
            ).toBeTruthy();
        });
    });

    it('все entryPointId в эффектах существуют', () => {
        const ids = new Set(SALES_PROCESS.entryPoints.map(e => e.id));

        SALES_QUESTIONS.flatMap(q => q.options)
            .map(o => o.effect)
            .filter(Boolean)
            .forEach(effect => {
                effect!.hideEntryPointIds?.forEach(id =>
                    expect(ids.has(id), `нет входа ${id}`).toBe(true),
                );
            });
    });
});

describe('регламент сильнее крутилки', () => {
    it('«только предварительные звонки» останавливает лид на «Переговорах»', () => {
        const model = withAnswers({ 'lead-reach': 'calls' });

        expect(model.leadCapStageId).toBe('sales_warm');
        expect(stageById(model, 'sales_warm').isLeadCovered).toBe(true);
        expect(stageById(model, 'sales_pres').isLeadCovered).toBe(false);
    });

    it('заблокированная регламентом стадия помечается отдельно от непокрытой', () => {
        const model = withAnswers({ 'lead-reach': 'calls' });

        // Крутилка на 100 % довела бы лид сюда — не пустил регламент.
        expect(stageById(model, 'sales_pres').isBlockedForLead).toBe(true);
        // А сюда лид не дошёл бы в любом случае: это конверсионный хвост.
        expect(stageById(model, 'sales_success').isBlockedForLead).toBe(false);
    });

    it('без ответа потолка нет — лид идёт до конца разрешённого', () => {
        const model = withAnswers({});

        expect(model.leadCapStageId).toBeNull();
        expect(stageById(model, 'sales_supply').isLeadCovered).toBe(true);
    });
});

describe('исполнители', () => {
    it('«кто первым смотрит лид» меняет исполнителя на «Новой»', () => {
        // По умолчанию вход разбирает администратор — он же стоит в описании
        // стадии. Ответ его переназначает.
        expect(stageById(withAnswers({}), 'sales_new').actor).toBe('adm');
        expect(
            stageById(withAnswers({ 'first-check': 'rop' }), 'sales_new').actor,
        ).toBe('rop');
    });

    it('«кто определяет ИНН» меняет исполнителя ШАГА, а не стадии', () => {
        const model = withAnswers({ 'inn-who': 'auto' });

        expect(model.stepActors.get('identify')).toBe('sys');
        // Стадии он не трогает: «кто первым смотрит» — отдельный вопрос.
        expect(stageById(model, 'sales_new').actor).toBe('adm');
        expect(stageById(model, 'sales_cold').actor).toBe('mgr');
        expect(stageById(model, 'sales_warm').actor).toBe('mgr');
    });

    it('администратор и руководитель — разные исполнители', () => {
        expect(
            stageById(withAnswers({ 'first-check': 'admin' }), 'sales_new')
                .actor,
        ).toBe('adm');
        expect(
            stageById(withAnswers({ 'first-check': 'rop' }), 'sales_new').actor,
        ).toBe('rop');
    });

    it('«кто решает по дублю» подписывает оба съезда', () => {
        const model = withAnswers({ 'duplicate-decision': 'mgr' });

        expect(model.exits.find(exit => exit.id === 'handover')?.actor).toBe(
            'mgr',
        );
        expect(model.exits.find(exit => exit.id === 'duplicate')?.actor).toBe(
            'mgr',
        );
    });
});

describe('глубина отчётности', () => {
    it('по умолчанию KPI пишется там, где для него есть событие', () => {
        const model = withAnswers({});

        expect(stageById(model, 'sales_cold').writesKpi).toBe(true);
        // У «Документов» KPI-события нет — сверено с mapEventType.
        expect(stageById(model, 'sales_offer_create').writesKpi).toBe(false);
    });

    it('«только с презентации» снимает отметку с более ранних стадий', () => {
        const model = withAnswers({ 'kpi-depth': 'from-presentation' });

        expect(stageById(model, 'sales_cold').writesKpi).toBe(false);
        expect(stageById(model, 'sales_warm').writesKpi).toBe(false);
        expect(stageById(model, 'sales_pres').writesKpi).toBe(true);
    });
});

describe('съезды с маршрута', () => {
    it('лид-фильтр убирает съезд «Дубль», сделка-фильтр — «Не наш профиль»', () => {
        const byLead = withAnswers({ 'filter-place': 'lead' }).exits.map(
            exit => exit.id,
        );
        const byDeal = withAnswers({ 'filter-place': 'deal' }).exits.map(
            exit => exit.id,
        );

        expect(byLead).not.toContain('duplicate');
        expect(byLead).toContain('junk');
        expect(byDeal).not.toContain('junk');
        expect(byDeal).toContain('duplicate');
    });

    it('«Отказ» остаётся при любом ответе', () => {
        expect(
            withAnswers({ 'filter-place': 'deal' }).exits.map(exit => exit.id),
        ).toContain('fail');
    });
});

describe('синхронизация статусов лида', () => {
    it('выключена по умолчанию и включается ответом', () => {
        expect(withAnswers({}).syncLeadStatuses).toBe(false);
        expect(withAnswers({ 'lead-status-auto': 'on' }).syncLeadStatuses).toBe(
            true,
        );
    });
});

describe('выключенные вопросы', () => {
    it('не влияют на модель, даже если ответ лежит в хранилище', () => {
        const clean = withAnswers({});
        const withInactive = withAnswers({ 'dedup-mode': 'auto' });

        expect(withInactive.stages.map(view => view.actor)).toEqual(
            clean.stages.map(view => view.actor),
        );
        expect(withInactive.exits.length).toBe(clean.exits.length);
    });
});
