import type {
    EnabledPlanIndicator,
    PlanAchievementRow,
} from '../plan-achievement.util';

/**
 * Включённые показатели портала: события, бакет звонков, финансы и
 * эфирное время (у последних двух колонок в таблицах нет).
 */
export const INDICATORS: EnabledPlanIndicator[] = [
    {
        code: 'calls_done',
        unit: 'count',
        factSource: 'kpi',
        factKey: 'call_done',
        defaultName: 'Звонки',
        displayName: 'Звонки',
        periodType: 'month',
    },
    {
        code: 'presentations_done',
        unit: 'count',
        factSource: 'kpi',
        factKey: 'presentation_done',
        defaultName: 'Презентации',
        displayName: 'Презентации',
        periodType: 'quarter',
    },
    {
        code: 'sales_monthly_amount',
        unit: 'money',
        factSource: 'finance',
        factKey: 'monthlyAmount',
        defaultName: 'Месячная сумма продаж',
        displayName: 'Месячная сумма продаж',
        periodType: 'month',
    },
    {
        code: 'airtime_minutes',
        unit: 'minutes',
        factSource: 'airtime',
        factKey: 'airtimeSeconds',
        defaultName: 'Эфирное время (мин)',
        displayName: 'Эфирное время (мин)',
        periodType: 'month',
    },
    {
        code: 'calls_over_30s',
        unit: 'count',
        factSource: 'calling',
        factKey: '30',
        defaultName: 'Звонки > 30 сек',
        displayName: 'Звонки > 30 сек',
        periodType: 'month',
    },
    {
        code: 'offers_sent',
        unit: 'count',
        factSource: 'kpi',
        factKey: 'ev_offer_act_send',
        defaultName: 'КП',
        displayName: 'КП',
        periodType: 'year',
    },
];

/** Строка достижения сотрудника: планы по кодам (нет кода — план не задан). */
export const achievementRow = (
    userId: number,
    plans: Partial<Record<string, number | null>>,
): PlanAchievementRow => ({
    userId,
    userName: `Сотрудник ${userId}`,
    cells: INDICATORS.map(indicator => ({
        code: indicator.code,
        plan: plans[indicator.code] ?? null,
        fact: 0,
        percent: null,
    })),
});

/** Иванов (id 1): планы по звонкам и презентациям, дробные — на период. */
export const IVANOV = achievementRow(1, {
    calls_done: 10.4,
    presentations_done: 4.6,
    calls_over_30s: 30,
});

/** Петров (id 2): план только по звонкам. */
export const PETROV = achievementRow(2, { calls_done: 20 });
