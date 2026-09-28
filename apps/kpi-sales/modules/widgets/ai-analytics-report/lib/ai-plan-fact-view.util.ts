import type {
    AiPlanFact,
    AiPlanFactRow,
} from '@/modules/entities/ai-analytics/model';
import {
    aiPlanFactReasonLabel,
    aiPlanFactRowHasPlan,
} from '@/modules/entities/ai-analytics/lib/ai-plan-fact.util';

/*
 * Чистая логика карточки «План — факт месяца»: группы таблицы, режим
 * показа (только факт / часть менеджеров с планом / у всех план), строка
 * покрытия планами и понятная подсказка, когда целей нет совсем.
 * Импорты сущности точечные (model / lib).
 */

/** Группа строк таблицы: подпись (отдел или менеджер) и строки по показателям. */
export interface AiPlanFactGroup {
    key: string;
    title: string;
    rows: AiPlanFactRow[];
}

/**
 * Режим таблицы: fact-only — целей нет ни у кого (или снимка нет), план
 * показывать нечего; partial — план задан не у всех менеджеров; full — у всех.
 */
export type AiPlanFactViewMode = 'fact-only' | 'partial' | 'full';

/** Покрытие планами: у скольких менеджеров из периметра есть хоть одна цель. */
export interface AiPlanFactCoverage {
    withPlan: number;
    total: number;
}

/** Колонка полной таблицы: подпись, подсказка и числовая ли (выравнивание вправо). */
export interface AiPlanFactColumn {
    key: string;
    label: string;
    hint?: string;
    numeric: boolean;
}

/** Причина ручки «снимка целей за месяц нет» (код бэка). */
export const AI_PLAN_FACT_SNAPSHOT_MISSING: AiPlanFact['reasons'][number] =
    'plan-snapshot-missing';

/** Причина ручки «план дня выключен»: в режиме «только факт» колонки «в день» нет. */
const AI_PLAN_FACT_DAILY_PLAN_DISABLED: AiPlanFact['reasons'][number] =
    'daily-plan-disabled';

/**
 * Главная подсказка режима «только факт». Снимок «Планов» снимается только
 * 1-го числа в 04:00 на НОВЫЙ месяц и за текущий не переснимается: текущий
 * месяц без снимка так и останется без сверки, закрытый — тем более.
 */
export const AI_PLAN_FACT_FACT_ONLY_NOTE = {
    current:
        'Планы этого месяца не зафиксированы — сверка по планам появится со следующего месяца, если задать планы («Планы» в шапке отчёта) до 1-го числа.',
    closed: 'Планы за месяц не были зафиксированы.',
} as const;

/** Подсказка «только факт» по месяцу: текущий — что сделать, закрытый — факт. */
export const aiPlanFactFactOnlyNote = (
    period: Pick<AiPlanFact['period'], 'closed'>,
): string =>
    period.closed
        ? AI_PLAN_FACT_FACT_ONLY_NOTE.closed
        : AI_PLAN_FACT_FACT_ONLY_NOTE.current;

/** Подпись ячейки строки без цели в полной таблице (вместо шести прочерков). */
export const AI_PLAN_FACT_NO_PLAN_CELL = 'плана нет';

/** Подпись под таблицей, которая сама ушла в «только факт» (досье без целей). */
export const AI_PLAN_FACT_NO_TARGETS_CAPTION =
    'Цели на месяц не заданы — показан только факт.';

const INDICATOR_COLUMN: AiPlanFactColumn = {
    key: 'indicator',
    label: 'Показатель',
    numeric: false,
};

const FACT_COLUMN: AiPlanFactColumn = {
    key: 'fact',
    label: 'Факт',
    hint: 'Сделано с начала месяца на дату расчёта',
    numeric: true,
};

/**
 * Колонки полной таблицы. Факт — сразу за показателем: он есть всегда, а
 * колонки от «План» до «Статус» у строки без цели схлопываются в одну.
 */
export const AI_PLAN_FACT_COLUMNS: readonly AiPlanFactColumn[] = [
    INDICATOR_COLUMN,
    FACT_COLUMN,
    {
        key: 'plan',
        label: 'План',
        hint: 'Цель месяца из снимка планов на 1-е число',
        numeric: true,
    },
    {
        key: 'pace',
        label: 'Темп',
        hint: 'Факт к тому, что по плану нужно было сделать к сегодняшнему рабочему дню. 100 % — ровно по плану, меньше — отстаём',
        numeric: true,
    },
    {
        key: 'forecast',
        label: 'Прогноз',
        hint: 'Сколько выйдет к концу месяца, если держать нынешний темп',
        numeric: true,
    },
    {
        key: 'gap',
        label: 'Разрыв',
        hint: 'План минус прогноз: больше нуля — до плана не хватит, меньше — прогноз выше плана',
        numeric: true,
    },
    {
        key: 'perDay',
        label: 'В день надо',
        hint: 'Сколько делать в каждый оставшийся рабочий день, чтобы закрыть план',
        numeric: true,
    },
    { key: 'status', label: 'Статус', numeric: false },
];

/** Сколько колонок занимает ячейка «плана нет»: от «План» до «Статус». */
export const AI_PLAN_FACT_PLAN_SPAN = AI_PLAN_FACT_COLUMNS.length - 2;

/** Колонки компактной таблицы режима «только факт». */
export const AI_PLAN_FACT_FACT_ONLY_COLUMNS: readonly AiPlanFactColumn[] = [
    INDICATOR_COLUMN,
    FACT_COLUMN,
];

/** Хоть у одной строки групп есть цель — иначе показывать план нечего. */
export const aiPlanFactGroupsHavePlan = (
    groups: readonly AiPlanFactGroup[],
): boolean => groups.some(group => group.rows.some(aiPlanFactRowHasPlan));

/**
 * Режим таблицы: factOnly передан — как есть (подсказку рисует карточка);
 * не передан — «только факт», когда целей нет ни в одной строке, и тогда
 * своя короткая подпись (досье без целей не остаётся без объяснения).
 */
export const resolveAiPlanFactTableMode = (
    groups: readonly AiPlanFactGroup[],
    factOnly?: boolean,
): { factOnly: boolean; caption: string | null } => {
    if (factOnly !== undefined) return { factOnly, caption: null };
    const auto = !aiPlanFactGroupsHavePlan(groups);
    const hasRows = groups.some(group => group.rows.length > 0);
    return {
        factOnly: auto,
        caption: auto && hasRows ? AI_PLAN_FACT_NO_TARGETS_CAPTION : null,
    };
};

/** Группы таблицы: свод отдела первым, затем менеджеры по имени. */
export const buildAiPlanFactGroups = (
    planFact: AiPlanFact,
    managerName: (managerId: string) => string,
): AiPlanFactGroup[] => [
    ...(planFact.team.length
        ? [{ key: 'team', title: 'Отдел (свод)', rows: planFact.team }]
        : []),
    ...planFact.rows
        .map(manager => ({
            key: manager.managerId,
            title: managerName(manager.managerId),
            rows: manager.rows,
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'ru')),
];

/** У скольких менеджеров периметра задана хоть одна цель месяца. */
export const aiPlanFactCoverage = (
    planFact: AiPlanFact,
): AiPlanFactCoverage => ({
    withPlan: planFact.rows.filter(manager =>
        manager.rows.some(aiPlanFactRowHasPlan),
    ).length,
    total: planFact.rows.length,
});

/** Бэк сообщил, что снимка целей за месяц нет. */
export const aiPlanFactSnapshotMissing = (planFact: AiPlanFact): boolean =>
    planFact.reasons.includes(AI_PLAN_FACT_SNAPSHOT_MISSING);

/**
 * Режим показа: снимка целей нет или ни у одной строки (включая свод) нет
 * цели — только факт; цели не у всех менеджеров — partial; иначе full.
 */
export const aiPlanFactViewMode = (
    planFact: AiPlanFact,
): AiPlanFactViewMode => {
    const anyPlan = [
        planFact.team,
        ...planFact.rows.map(manager => manager.rows),
    ].some(rows => rows.some(aiPlanFactRowHasPlan));
    if (aiPlanFactSnapshotMissing(planFact) || !anyPlan) return 'fact-only';
    const { withPlan, total } = aiPlanFactCoverage(planFact);
    return withPlan < total ? 'partial' : 'full';
};

/** «из 1 менеджера», «из 5 менеджеров», «из 21 менеджера» (родительный падеж). */
const managersGenitive = (count: number): string =>
    count % 10 === 1 && count % 100 !== 11 ? 'менеджера' : 'менеджеров';

/** Строка покрытия: «План задан у 3 из 18 менеджеров». */
export const formatAiPlanFactCoverage = ({
    withPlan,
    total,
}: AiPlanFactCoverage): string =>
    `План задан у ${withPlan} из ${total} ${managersGenitive(total)}`;

/**
 * Причины ручки по-русски: текст бэка, иначе подпись кода. В режиме
 * «только факт» без «план дня выключен» — колонки «в день» там нет.
 */
export const aiPlanFactReasonLines = (
    planFact: AiPlanFact,
    mode: AiPlanFactViewMode = 'full',
): string[] =>
    planFact.reasons.flatMap((code, index) =>
        mode === 'fact-only' && code === AI_PLAN_FACT_DAILY_PLAN_DISABLED
            ? []
            : [planFact.reasonTexts[index] ?? aiPlanFactReasonLabel(code)],
    );

/** Всё, что карточке нужно показать над таблицей и в ней. */
export interface AiPlanFactView {
    mode: AiPlanFactViewMode;
    groups: AiPlanFactGroup[];
    /** «План задан у N из M менеджеров» — только когда планы есть не у всех. */
    coverageText: string | null;
    /**
     * Главная подсказка «что сделать» — в режиме «только факт», кроме
     * пустого периметра при целом снимке (там дело не в целях).
     */
    note: string | null;
    /** Причины бэка: в режиме «только факт» — вторичная деталь под подсказкой. */
    reasonLines: string[];
    /** В периметре нет ни свода, ни менеджеров. */
    empty: boolean;
}

/** Собирает вид карточки из ответа ручки. */
export const buildAiPlanFactView = (
    planFact: AiPlanFact,
    managerName: (managerId: string) => string,
): AiPlanFactView => {
    const mode = aiPlanFactViewMode(planFact);
    const empty = !planFact.rows.length && !planFact.team.length;
    const showNote =
        mode === 'fact-only' && (!empty || aiPlanFactSnapshotMissing(planFact));
    return {
        mode,
        groups: buildAiPlanFactGroups(planFact, managerName),
        coverageText:
            mode === 'partial'
                ? formatAiPlanFactCoverage(aiPlanFactCoverage(planFact))
                : null,
        note: showNote ? aiPlanFactFactOnlyNote(planFact.period) : null,
        reasonLines: aiPlanFactReasonLines(planFact, mode),
        empty,
    };
};
