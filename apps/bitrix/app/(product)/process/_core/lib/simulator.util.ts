/**
 * Логика симулятора — чистые функции, никакого React.
 *
 * Симулятор не «показывает мультик»: он повторяет те же правила, что и бэкенд.
 * Лестница односторонняя (стадию нельзя понизить), цель считается как максимум
 * из [событие отчёта, событие плана, текущая стадия], «Продажа» и «Отказ»
 * перебивают всё, а постпродажная «Поставка» намеренно не двигает сделку и не
 * пишет KPI. Всё это сверено с `deal-target-stage.calculator.ts`.
 */

import {
    findContact,
    findEventType,
    findFailReason,
    findFailType,
    SIM_NORESULT_REASONS,
} from '../constants/sim-events';
import type { ProcessDefinition, ProcessModel } from '../types';

export type SimStatus = 'in-work' | 'set-aside' | 'sale' | 'fail';

/**
 * Запись в «ОП KPI». Именно из них собирается итоговый разбор пути.
 * Тип нужен, чтобы график красил столбцы в цвет события.
 */
export interface SimKpiRecord {
    eventCode: string;
    label: string;
    isResult: boolean;
}

export interface SimLogEntry {
    id: string;
    /** Что сделал человек. */
    action: string;
    /** Где это произошло. */
    place: string;
    stageLabel: string;
    /** Что система сделала сама в ответ. */
    systemActions: string[];
    /** Записи KPI, созданные этим шагом. */
    kpi: SimKpiRecord[];
}

/**
 * Запланированное дело — то, что менеджер видит списком в приложении «Звонки».
 * Дел может быть несколько сразу: именно поэтому список, а не одно поле.
 */
export interface SimTask {
    id: string;
    eventCode: string;
    title: string;
    isImportant: boolean;
    createdAtStep: number;
    /** Срок, как его поставил менеджер при планировании. */
    deadline?: string;
    /** Контакт, с которым назначено событие. */
    contactId?: string | null;
    /** Комментарий менеджера — он уезжает в заголовочное поле задачи. */
    comment?: string;
    /** Задача другой компании: видна в списке, но не открывается. */
    foreignCompany?: string;
}

export interface SimState {
    /** Точка входа, с которой начали. */
    entryPointId: string;
    company: string;
    stageIndex: number;
    /** Список запланированных дел. */
    tasks: SimTask[];
    /**
     * По какому делу отчитываемся прямо сейчас.
     * null — менеджер в списке дел, как на первом экране приложения.
     */
    activeTaskId: string | null;
    status: SimStatus;
    log: SimLogEntry[];
    /**
     * Определилась ли компания на входе.
     * null — вход ещё не разобран; false — тот самый случай «один из десяти»,
     * когда менеджеру достаётся сделка без компании.
     */
    companyKnown: boolean | null;
}

export interface SimReport {
    result: 'result' | 'noresult';
    noresultReason?: string;
    comment: string;
    /** Код статуса работы: inJob | setAside | success | fail. */
    workStatus: string;
    /** Тип отказа — обязателен при статусе «Отказ». */
    failType?: string;
    /** Возражение клиента — обязательно при статусе «Отказ». */
    failReason?: string;
    presentationDone: boolean;
    /** С кем говорили. Не обязан совпадать с контактом плана. */
    reportContactId: string | null;
    /** Что планируем дальше. null — не планируем. */
    nextEventCode: string | null;
    planTitle?: string;
    planDeadline?: string;
    /** С кем встречаемся дальше. */
    planContactId: string | null;
}

const stageIndexById = (
    definition: ProcessDefinition,
    stageId: string,
): number => definition.stages.findIndex(stage => stage.id === stageId);

/** Индекс стадии, на которую тянет событие. -1, если событие ничего не двигает. */
const stageIndexForEvent = (
    definition: ProcessDefinition,
    code: string | null,
): number => {
    if (!code) return -1;
    const event = findEventType(code);
    return event ? stageIndexById(definition, event.targetStageId) : -1;
};

const reasonLabel = (code?: string): string =>
    SIM_NORESULT_REASONS.find(item => item.code === code)?.label ??
    'не указана';

/** Где сейчас идёт работа — по той же модели, что рисует хребет. */
export const simPlace = (model: ProcessModel, stageIndex: number): string => {
    const view = model.stages[stageIndex];
    if (!view) return '—';

    return {
        lead: 'в лиде',
        deal: 'в сделке',
        both: 'в лиде и в сделке',
        none: 'нигде — стадию не ведёт ни одна сущность',
    }[view.owner];
};

/**
 * Первая стадия, на которой в работу включается человек.
 * С неё симулятор и стартует: до этого всё делает автоматика.
 */
export const firstHumanStageIndex = (model: ProcessModel): number => {
    const index = model.stages.findIndex(view => view.actor !== 'sys');
    return index === -1 ? 0 : index;
};

/** Заголовок дела собирается так же, как на бэкенде: тип плюс эмодзи важного. */
export const createSimTask = (
    eventCode: string,
    step: number,
    seq: number,
    extra: Partial<Pick<SimTask, 'deadline' | 'contactId' | 'comment'>> & {
        title?: string;
    } = {},
): SimTask => {
    const event = findEventType(eventCode);
    const typeLabel = event?.label ?? eventCode;

    return {
        id: `task-${step}-${seq}`,
        eventCode,
        // Заголовок задачи — то, что написал менеджер. Тип в него не
        // вклеивается: он хранится отдельным полем и задаёт цвет.
        title: extra.title?.trim() || typeLabel,
        isImportant: Boolean(event?.emoji),
        createdAtStep: step,
        deadline: extra.deadline,
        contactId: extra.contactId,
        comment: extra.comment,
    };
};

export const createSimState = (
    entryPointId: string,
    company: string,
    stageIndex: number,
    plannedEventCode: string,
): SimState => ({
    entryPointId,
    company,
    stageIndex,
    tasks: [createSimTask(plannedEventCode, 0, 0)],
    activeTaskId: null,
    status: 'in-work',
    log: [],
    companyKnown: null,
});

/** Чем закончился разбор входа администратором. */
export type SimGateOutcome = 'identified' | 'unknown' | 'duplicate';

export interface PassToManagerInput {
    state: SimState;
    outcome: SimGateOutcome;
    definition: ProcessDefinition;
    model: ProcessModel;
    entryId: string;
}

/**
 * Разбор входа: администратор смотрит лид и передаёт клиента менеджеру.
 *
 * Это отдельный экран, а не форма «Звонки»: приложения у администратора нет —
 * при рекомендованной схеме оно живёт в сделке, а он работает в лиде. Раньше
 * симулятор давал ему форму менеджера, то есть показывал то, чего не бывает.
 */
export const passToManager = ({
    state,
    outcome,
    definition,
    model,
    entryId,
}: PassToManagerInput): SimState => {
    const coldIndex = stageIndexById(definition, 'sales_cold');
    const systemActions: string[] = [];

    if (outcome === 'duplicate') {
        systemActions.push(
            'Дубль не передаётся автоматически: решение принимает руководитель.',
            'Он либо оставляет клиента тому, кто уже ведёт работу, либо запускает хук на нового ответственного.',
            'Съезд «Передали сотруднику» — механики в коде пока нет.',
        );

        return {
            ...state,
            companyKnown: true,
            log: [
                ...state.log,
                {
                    id: entryId,
                    action: 'Разобрал вход: нашёлся дубль — ушло руководителю',
                    place: simPlace(model, state.stageIndex),
                    stageLabel:
                        definition.stages[state.stageIndex]?.label ?? '—',
                    systemActions,
                    kpi: [],
                },
            ],
        };
    }

    const identified = outcome === 'identified';

    systemActions.push(
        identified
            ? 'Компания и ИНН определены — менеджер получает клиента разобранным.'
            : 'Компанию определить не удалось. Сделка заводится без неё: иначе такого клиента некуда положить.',
        'Срабатывает хук: сделка в «ОП Основная» на «Холодных», спутник в «ОП Холодные», задача с дедлайном и две записи — в «ОП KPI» и «ОП История работы».',
        'Лид закрывается успешно: он свою работу сделал — оказался не мусором.',
    );

    if (!identified) {
        systemActions.push(
            'Менеджеру придётся выяснить компанию самому, звонком на «Холодных».',
        );
    }

    return {
        ...state,
        stageIndex: Math.max(state.stageIndex, coldIndex),
        companyKnown: identified,
        log: [
            ...state.log,
            {
                id: entryId,
                action: identified
                    ? 'Разобрал вход: компания определена, передал менеджеру'
                    : 'Разобрал вход: компанию определить не удалось, передал как есть',
                place: simPlace(model, state.stageIndex),
                stageLabel: definition.stages[state.stageIndex]?.label ?? '—',
                systemActions,
                kpi: [],
            },
        ],
    };
};

/** Открыть дело — перейти из списка в форму отчёта. */
export const openSimTask = (state: SimState, taskId: string): SimState => ({
    ...state,
    activeTaskId: taskId,
});

/** Вернуться к списку дел, не отчитываясь. */
export const backToSimList = (state: SimState): SimState => ({
    ...state,
    activeTaskId: null,
});

/**
 * Завести новое дело, не отчитываясь по текущему.
 *
 * Планирование САМО двигает сделку по лестнице — в калькуляторе `planEventType`
 * стоит первым кандидатом наравне с отчётом. Поэтому дел может быть несколько
 * сразу, и стадия всегда равна максимуму по всем запланированным: понизить её
 * нельзя, а каждое планирование поднимает.
 */
export const addSimTask = (
    state: SimState,
    eventCode: string,
    definition: ProcessDefinition,
): SimState => {
    const target = stageIndexForEvent(definition, eventCode);

    return {
        ...state,
        stageIndex: Math.max(state.stageIndex, target),
        tasks: [
            ...state.tasks,
            createSimTask(eventCode, state.log.length, state.tasks.length),
        ],
    };
};

/**
 * Что происходит с дополнительными воронками при исходе.
 *
 * Продажа и отказ закрывают всё — но каждая воронка встаёт на СВОЮ
 * терминальную стадию: у ХО это `cold_*`, у презентаций `spres_*`, у ТМЦ
 * `sales_tmc_*`. Общей стадии «Успех» на всех нет, и это не мелочь: иначе
 * невозможно отличить проданную презентацию от сорванной.
 */
const closingActions = (
    model: ProcessModel,
    status: 'sale' | 'fail',
): string[] => {
    const suffix = status === 'sale' ? 'Успех' : 'Отказ';

    return model.satellites.map(
        satellite =>
            `Воронка «${satellite.label}» закрыта: незакрытые сделки этой воронки уходят на свою стадию «${suffix}» — по её собственному условию, а не по стадии основной.`,
    );
};

export interface ApplyReportInput {
    state: SimState;
    report: SimReport;
    definition: ProcessDefinition;
    model: ProcessModel;
    /** Идентификатор записи лога — передаём снаружи, чтобы функция была чистой. */
    entryId: string;
}

/** Прогоняет отчёт менеджера и возвращает новое состояние симулятора. */
export const applyReport = ({
    state,
    report,
    definition,
    model,
    entryId,
}: ApplyReportInput): SimState => {
    const activeTask = state.tasks.find(task => task.id === state.activeTaskId);
    const reported = findEventType(activeTask?.eventCode ?? '');
    const planned = findEventType(report.nextEventCode ?? '');
    const systemActions: string[] = [];

    const isSale = report.workStatus === 'success';
    const isFail = report.workStatus === 'fail';
    const isResult = report.result === 'result';
    // «Нерезультативно, но следующий шаг назначен» — это перенос: система
    // двигает дедлайн существующей задачи и НЕ заводит новую.
    const isExpired = !isResult && Boolean(report.nextEventCode);

    let stageIndex = state.stageIndex;

    if (isSale) {
        stageIndex = stageIndexById(definition, 'sales_success');
        systemActions.push(
            'Основная сделка переведена в «Успех» — продажа закрывает её.',
            ...closingActions(model, 'sale'),
            'Приложение и хуки больше не видят эту сделку как текущую.',
            'Дальше общаться с клиентом можно только постпродажным типом «Поставка».',
        );
    } else if (isFail) {
        const type = findFailType(report.failType ?? '')?.label ?? '—';
        const reason = findFailReason(report.failReason ?? '')?.label ?? '—';

        systemActions.push(
            `Основная сделка уехала в «Отказ». Тип отказа: ${type.toLowerCase()}; возражение: ${reason.toLowerCase()}.`,
            ...closingActions(model, 'fail'),
            'Компания уходит в буфер отказников — оттуда она вернётся в холодный обзвон, уже к другому менеджеру.',
        );
    } else if (isResult) {
        // Лестница односторонняя: берём максимум и никогда не понижаем.
        const candidates = [
            state.stageIndex,
            stageIndexForEvent(definition, activeTask?.eventCode ?? null),
            stageIndexForEvent(definition, report.nextEventCode),
        ];
        const target = Math.max(...candidates);

        if (target > state.stageIndex) {
            stageIndex = target;
            systemActions.push(
                `Основная сделка поднята на «${definition.stages[target]?.label}».`,
            );
        } else {
            systemActions.push(
                'Стадия сделки не изменилась — понизить её нельзя.',
            );
        }
    }

    if (isExpired) {
        systemActions.push(
            'Дедлайн текущей задачи перенесён. Новая задача НЕ создаётся.',
        );
    } else {
        systemActions.push('Текущая задача закрыта.');
        if (planned) {
            const title = report.planTitle?.trim() || planned.label;
            // Тип повторяем только если менеджер дал задаче своё название:
            // иначе получилось бы «задача „Презентация“ с типом „Презентация“».
            const withType =
                title === planned.label ? '' : ` с типом «${planned.label}»`;
            const when = report.planDeadline
                ? `, срок — ${report.planDeadline}`
                : '';
            const withWhom = findContact(report.planContactId);

            systemActions.push(
                `Создана задача «${title}»${withType}${when}${
                    planned.emoji ? ' и высоким приоритетом' : ''
                }.`,
            );
            if (withWhom) {
                systemActions.push(
                    `Контакт следующего события: ${withWhom.name} (${withWhom.role}).`,
                );
            }
        }
    }

    const kpi: SimKpiRecord[] = [];

    if (!isResult) {
        systemActions.push(
            `В KPI записан нерезультативный звонок. Причина: ${reasonLabel(
                report.noresultReason,
            ).toLowerCase()}.`,
        );
        if (reported) {
            kpi.push({
                eventCode: reported.code,
                label: `${reported.label} — нерезультативно`,
                isResult: false,
            });
        }
    } else if (reported?.writesKpi) {
        systemActions.push(
            `В «ОП KPI» и «ОП История работы» записано событие «${reported.label}».`,
        );
        kpi.push({
            eventCode: reported.code,
            label: reported.label,
            isResult: true,
        });
    } else if (reported) {
        systemActions.push(
            `У события «${reported.label}» записи KPI нет — оно живёт только в лестнице сделок.`,
        );
    }

    /**
     * Презентация даёт ДВЕ отдельные записи, и это принципиально: запланировать
     * и провести — разные факты. Именно их разница показывает, сколько встреч
     * срывается, а без неё видно только итог.
     */
    if (planned?.code === 'presentation') {
        systemActions.push(
            'В список «Презентации» добавлена запись «Презентация запланирована», заведена сделка-спутник в воронке «ОП Презентации».',
        );
        kpi.push({
            eventCode: 'presentation',
            label: 'Презентация запланирована',
            isResult: true,
        });
    }

    if (report.presentationDone) {
        systemActions.push(
            'Сделка-спутник в «ОП Презентации» переведена в «Проведена», в списке появилась запись «Презентация проведена».',
            'Счётчик проведённых презентаций в карточке увеличен.',
        );
        kpi.push({
            eventCode: 'presentation',
            label: 'Презентация проведена',
            isResult: true,
        });
    }

    if (model.syncLeadStatuses && model.callsApp.inLead) {
        systemActions.push(
            'Статус связанного лида обновлён автоматически — так настроен портал.',
        );
    }

    const talkedTo = findContact(report.reportContactId);
    if (talkedTo) {
        systemActions.push(
            `В историю работы записано, с кем говорили: ${talkedTo.name} (${talkedTo.role}).`,
        );
    }

    if (report.comment) {
        systemActions.push(
            `Комментарий разошёлся сразу в несколько мест — задача, KPI, история работы и карточка компании: «${report.comment}».`,
        );
    }

    systemActions.push(
        'Обновлены поля карточки: даты, комментарий, история работы, статус.',
    );

    const status: SimStatus = isSale
        ? 'sale'
        : isFail
          ? 'fail'
          : report.workStatus === 'setAside'
            ? 'set-aside'
            : 'in-work';

    /**
     * Отработанное дело уходит из списка — кроме переноса: там задача та же,
     * у неё лишь сдвинулся дедлайн, поэтому она остаётся на месте.
     */
    const keptTasks = isExpired
        ? state.tasks
        : state.tasks.filter(task => task.id !== state.activeTaskId);

    const nextTasks =
        isSale || isFail
            ? []
            : isExpired || !report.nextEventCode
              ? keptTasks
              : [
                    ...keptTasks,
                    createSimTask(
                        report.nextEventCode,
                        state.log.length + 1,
                        keptTasks.length,
                        {
                            title: report.planTitle,
                            deadline: report.planDeadline,
                            contactId: report.planContactId,
                            comment: report.comment,
                        },
                    ),
                ];

    return {
        ...state,
        stageIndex,
        status,
        tasks: nextTasks,
        // После отправки менеджер возвращается в список дел — как в приложении.
        activeTaskId: null,
        log: [
            ...state.log,
            {
                id: entryId,
                action: isResult
                    ? `Отчитался: «${reported?.label ?? 'событие'}» — результативно`
                    : `Отчитался: «${reported?.label ?? 'событие'}» — нерезультативно`,
                place: simPlace(model, state.stageIndex),
                stageLabel: definition.stages[state.stageIndex]?.label ?? '—',
                systemActions,
                kpi,
            },
        ],
    };
};
