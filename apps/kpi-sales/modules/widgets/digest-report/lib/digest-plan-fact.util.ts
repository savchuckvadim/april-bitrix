/**
 * Сопоставление дня с планами руководителя (фича «Планы»): факт дня из
 * данных дайджеста, план на день — цель периода, пропорционально одному
 * календарному дню (planForRange). Финансовые показатели в дне не
 * считаются (plan/fact null → «—»).
 */
import {
    callTypesTotal,
    type DigestEmployee,
} from '@/modules/entities/digest';
import {
    planForRange,
    type EnabledPlanIndicator,
    type PlanAchievementCell,
    type PlanAchievementRow,
} from '@/modules/feature/plans';

const ACT_SEND_SUFFIX = '_act_send';
const DONE_SUFFIX = '_done';

/** Факт показателя за день; null — источник в дне недоступен. */
export const digestPlanFact = (
    employee: DigestEmployee,
    indicator: Pick<EnabledPlanIndicator, 'factSource' | 'factKey'>,
): number | null => {
    const { factSource, factKey } = indicator;
    if (factSource === 'kpi') {
        if (factKey.endsWith(ACT_SEND_SUFFIX)) {
            const type = factKey.slice(0, -ACT_SEND_SUFFIX.length);
            return employee.documents.byType[type] ?? 0;
        }
        if (factKey.endsWith(DONE_SUFFIX)) {
            const type = factKey.slice(0, -DONE_SUFFIX.length);
            if (type === 'call') return callTypesTotal(employee.done.byType);
            if (type === 'ev_success') return employee.sales;
            if (type === 'ev_fail') return employee.refusals;
            return employee.done.byType[type] ?? 0;
        }
        return 0;
    }
    if (factSource === 'calling') {
        return employee.calls ? (employee.calls.byDuration[factKey] ?? 0) : null;
    }
    if (factSource === 'airtime') {
        return employee.calls ? Math.round(employee.calls.airtimeSeconds / 60) : null;
    }
    return null;
};

/** Строки «сотрудник × показатель» с планом на один день. */
export const buildDigestPlanRows = (
    employees: readonly DigestEmployee[],
    indicators: readonly EnabledPlanIndicator[],
    targetsByUser: Record<number, Record<string, number | null> | undefined>,
    date: string,
): PlanAchievementRow[] =>
    employees.map(employee => ({
        userId: employee.userId,
        userName: employee.name,
        cells: indicators.map((indicator): PlanAchievementCell => {
            const fact = digestPlanFact(employee, indicator);
            const rawTarget = targetsByUser[employee.userId]?.[indicator.code] ?? null;
            const plan =
                fact === null || rawTarget === null || rawTarget <= 0
                    ? null
                    : planForRange(rawTarget, indicator.periodType, date, date);
            return {
                code: indicator.code,
                plan,
                fact: fact ?? 0,
                percent: plan ? (fact ?? 0) / plan : null,
            };
        }),
    }));

/** Рабочее окно дня для «ожидаемого сейчас» (риска прогресса). */
const WORK_DAY_START_HOUR = 9;
const WORK_DAY_END_HOUR = 18;

/**
 * Доля рабочего дня, прошедшая к «сейчас»: прошлый день — 1, будущий — 0,
 * сегодня — по окну 9:00–18:00.
 */
export const expectedShareOfDay = (date: string, now: Date = new Date()): number => {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (date < today) return 1;
    if (date > today) return 0;
    const hours = now.getHours() + now.getMinutes() / 60;
    const share =
        (hours - WORK_DAY_START_HOUR) / (WORK_DAY_END_HOUR - WORK_DAY_START_HOUR);
    return Math.min(1, Math.max(0, share));
};
