/**
 * Презентации дня по сотрудникам: сводка, план руководителя на день,
 * исполняемость плана и конверсия плана CRM; рейтинги. Чистые функции.
 */
import {
    summarizePresentations,
    type DigestPresentation,
    type PresSummary,
} from '@/modules/entities/digest';
import {
    planForRange,
    type EnabledPlanIndicator,
} from '@/modules/feature/plans';

/** Ключ факта показателя «Презентации» в каталоге планов. */
export const PRESENTATIONS_PLAN_FACT_KEY = 'presentation_done';

export interface PresEmployeeRow {
    userId: number;
    name: string;
    summary: PresSummary;
    /** План руководителя на день; null — не задан или показатель выключен. */
    managerPlan: number | null;
    /** Проведено / план руководителя; null — нет плана. */
    planExecution: number | null;
    complects: string[];
}

/** Показатель «Презентации» среди включённых планов (по ключу факта). */
export const presentationsIndicator = (
    indicators: readonly EnabledPlanIndicator[],
): EnabledPlanIndicator | null =>
    indicators.find(
        indicator =>
            indicator.factSource === 'kpi' && indicator.factKey === PRESENTATIONS_PLAN_FACT_KEY,
    ) ?? null;

export const buildPresEmployeeRows = (
    items: readonly DigestPresentation[],
    userIds: readonly number[],
    nameOf: (userId: number) => string,
    indicator: EnabledPlanIndicator | null,
    targetsByUser: Record<number, Record<string, number | null> | undefined>,
    date: string,
): PresEmployeeRow[] =>
    userIds
        .map(userId => {
            const own = items.filter(item => item.assignedId === userId);
            const summary = summarizePresentations(own);
            const target = indicator ? (targetsByUser[userId]?.[indicator.code] ?? null) : null;
            const managerPlan =
                indicator && target !== null && target > 0
                    ? planForRange(target, indicator.periodType, date, date)
                    : null;
            return {
                userId,
                name: nameOf(userId),
                summary,
                managerPlan,
                planExecution: managerPlan ? summary.held / managerPlan : null,
                complects: [
                    ...new Set(
                        own
                            .filter(item => item.dayStatus === 'held' && item.complectName)
                            .map(item => item.complectName as string),
                    ),
                ],
            };
        })
        .filter(row => row.summary.total > 0 || row.managerPlan !== null);

/** Σ по строкам: планы руководителя только заданные; доли из сумм. */
export const totalPresRow = (rows: readonly PresEmployeeRow[]): {
    managerPlan: number | null;
    planExecution: number | null;
} => {
    const withPlan = rows.filter(row => row.managerPlan !== null);
    const plan = withPlan.reduce((sum, row) => sum + (row.managerPlan ?? 0), 0);
    const held = rows.reduce((sum, row) => sum + row.summary.held, 0);
    return {
        managerPlan: withPlan.length ? Math.round(plan * 100) / 100 : null,
        planExecution: withPlan.length && plan > 0 ? held / plan : null,
    };
};

export type PresRatingCode = 'planExecution' | 'planConversion' | 'held' | 'heldSum';

export interface PresRatingEntry {
    userId: number;
    name: string;
    value: number;
    rank: number;
}

export interface PresRatingBoard {
    code: PresRatingCode;
    title: string;
    kind: 'percent' | 'count' | 'money';
    entries: PresRatingEntry[];
}

const RATING_TOP_N = 5;

const valueOf = (row: PresEmployeeRow, code: PresRatingCode): number | null => {
    switch (code) {
        case 'planExecution':
            return row.planExecution;
        case 'planConversion':
            return row.summary.planConversion;
        case 'held':
            return row.summary.total > 0 ? row.summary.held : null;
        case 'heldSum':
            return row.summary.heldSum > 0 ? row.summary.heldSum : null;
    }
};

const RATING_DEFS: readonly Omit<PresRatingBoard, 'entries'>[] = [
    { code: 'planExecution', title: 'Исполнение плана руководителя', kind: 'percent' },
    { code: 'planConversion', title: 'Конверсия плана CRM', kind: 'percent' },
    { code: 'held', title: 'Проведено', kind: 'count' },
    { code: 'heldSum', title: 'Сумма по комплектам', kind: 'money' },
];

export const buildPresRatings = (rows: readonly PresEmployeeRow[]): PresRatingBoard[] =>
    RATING_DEFS.map(def => {
        const ranked = rows
            .map(row => ({ row, value: valueOf(row, def.code) }))
            .filter((entry): entry is { row: PresEmployeeRow; value: number } => entry.value !== null)
            .sort((a, b) => b.value - a.value || a.row.name.localeCompare(b.row.name, 'ru'))
            .map(({ row, value }) => ({ userId: row.userId, name: row.name, value, rank: 0 }));
        ranked.forEach((entry, index) => {
            const prev = ranked[index - 1];
            entry.rank = prev && prev.value === entry.value ? prev.rank : index + 1;
        });
        return { ...def, entries: ranked.slice(0, RATING_TOP_N) };
    });

/** Доля 0.84 → «84%»; деньги — «144 000 ₽». */
export const formatPresValue = (value: number | null, kind: PresRatingBoard['kind']): string => {
    if (value === null) return '—';
    if (kind === 'percent') return `${Math.round(value * 100)}%`;
    if (kind === 'money') return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
    return Math.round(value).toLocaleString('ru-RU');
};
