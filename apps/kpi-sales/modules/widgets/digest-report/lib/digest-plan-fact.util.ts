/**
 * Связка «запланировано в CRM → план руководителя → факт» за день (фича
 * «Планы»): факт дня из данных дайджеста, план на день — цель периода,
 * пропорционально одному календарному дню (planForRange), план CRM —
 * события с дедлайном в этот день по группе показателя. Финансовые
 * показатели в дне не считаются (null → «—»).
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

type IndicatorRef = Pick<EnabledPlanIndicator, 'factSource' | 'factKey'>;

/** Тип события показателя kpi (`call_done` → call, `presentation_done` → presentation). */
const kpiDoneType = (indicator: IndicatorRef): string | null => {
    if (indicator.factSource !== 'kpi' || !indicator.factKey.endsWith(DONE_SUFFIX)) {
        return null;
    }
    return indicator.factKey.slice(0, -DONE_SUFFIX.length);
};

/** Факт показателя за день; null — источник в дне недоступен. */
export const digestPlanFact = (
    employee: DigestEmployee,
    indicator: IndicatorRef,
): number | null => {
    const { factSource, factKey } = indicator;
    if (factSource === 'kpi') {
        if (factKey.endsWith(ACT_SEND_SUFFIX)) {
            const type = factKey.slice(0, -ACT_SEND_SUFFIX.length);
            return employee.documents.byType[type] ?? 0;
        }
        const type = kpiDoneType(indicator);
        if (type === null) return 0;
        if (type === 'call') return callTypesTotal(employee.done.byType);
        if (type === 'ev_success') return employee.sales;
        if (type === 'ev_fail') return employee.refusals;
        return employee.done.byType[type] ?? 0;
    }
    if (factSource === 'calling') {
        return employee.calls ? (employee.calls.byDuration[factKey] ?? 0) : null;
    }
    if (factSource === 'airtime') {
        return employee.calls ? Math.round(employee.calls.airtimeSeconds / 60) : null;
    }
    return null;
};

/**
 * Запланировано в CRM на день по показателю: звонки — все подтипы звонка,
 * презентации — presentation; у документов, продаж, телефонии плана в
 * CRM нет (null).
 */
export const digestPlanCrmPlanned = (
    employee: DigestEmployee,
    indicator: IndicatorRef,
): number | null => {
    const type = kpiDoneType(indicator);
    if (type === null || type === 'ev_success' || type === 'ev_fail') return null;
    if (type === 'call') return callTypesTotal(employee.plannedAtStart.byType);
    return employee.plannedAtStart.byType[type] ?? 0;
};

/** Ячейка плана дня: цель руководителя + план CRM + факт и две доли. */
export interface DigestPlanCell extends PlanAchievementCell {
    /** Запланировано в CRM на день; null — у показателя нет плана в CRM. */
    crmPlanned: number | null;
    /** Факт / план CRM (конверсия плана дня); null — нет базы. */
    crmPercent: number | null;
}

export interface DigestPlanRow extends PlanAchievementRow {
    cells: DigestPlanCell[];
}

const ratio = (numerator: number, denominator: number | null): number | null =>
    denominator && denominator > 0 ? numerator / denominator : null;

/** Строки «сотрудник × показатель» с планом на один день. */
export const buildDigestPlanRows = (
    employees: readonly DigestEmployee[],
    indicators: readonly EnabledPlanIndicator[],
    targetsByUser: Record<number, Record<string, number | null> | undefined>,
    date: string,
): DigestPlanRow[] =>
    employees.map(employee => ({
        userId: employee.userId,
        userName: employee.name,
        cells: indicators.map((indicator): DigestPlanCell => {
            const fact = digestPlanFact(employee, indicator);
            const rawTarget = targetsByUser[employee.userId]?.[indicator.code] ?? null;
            const plan =
                fact === null || rawTarget === null || rawTarget <= 0
                    ? null
                    : planForRange(rawTarget, indicator.periodType, date, date);
            const crmPlanned = fact === null ? null : digestPlanCrmPlanned(employee, indicator);
            return {
                code: indicator.code,
                plan,
                fact: fact ?? 0,
                percent: plan ? (fact ?? 0) / plan : null,
                crmPlanned,
                crmPercent: ratio(fact ?? 0, crmPlanned),
            };
        }),
    }));

/** Σ по строкам: планы (заданные), планы CRM, факты; доли из сумм. */
export const aggregateDigestPlanCells = (
    indicators: readonly EnabledPlanIndicator[],
    rows: readonly DigestPlanRow[],
): DigestPlanCell[] =>
    indicators.map((indicator, index) => {
        let planSum = 0;
        let hasPlan = false;
        let crmSum = 0;
        let hasCrm = false;
        let factSum = 0;
        for (const row of rows) {
            const cell = row.cells[index];
            if (!cell) continue;
            factSum += cell.fact;
            if (cell.plan !== null) {
                planSum += cell.plan;
                hasPlan = true;
            }
            if (cell.crmPlanned !== null) {
                crmSum += cell.crmPlanned;
                hasCrm = true;
            }
        }
        const plan = hasPlan ? Math.round(planSum * 100) / 100 : null;
        const crmPlanned = hasCrm ? crmSum : null;
        return {
            code: indicator.code,
            plan,
            fact: Math.round(factSum * 100) / 100,
            percent: plan ? factSum / plan : null,
            crmPlanned,
            crmPercent: ratio(factSum, crmPlanned),
        };
    });

export interface DigestPlanRankEntry {
    userId: number;
    name: string;
    /** Доля выполнения плана руководителя (0.84). */
    percent: number;
    fact: number;
    plan: number;
    rank: number;
}

export interface DigestPlanRatingBoard {
    indicator: EnabledPlanIndicator;
    entries: DigestPlanRankEntry[];
    /** Сколько сотрудников с заданным планом участвует. */
    participants: number;
}

const RATING_TOP_N = 5;

/** Рейтинг достигаемости плана руководителя по каждому показателю (только с планом). */
export const buildDigestPlanRatingBoards = (
    indicators: readonly EnabledPlanIndicator[],
    rows: readonly DigestPlanRow[],
): DigestPlanRatingBoard[] =>
    indicators.map((indicator, index) => {
        const ranked: DigestPlanRankEntry[] = rows
            .flatMap(row => {
                const cell = row.cells[index];
                if (!cell || cell.plan === null || cell.percent === null) return [];
                return [
                    {
                        userId: row.userId,
                        name: row.userName,
                        percent: cell.percent,
                        fact: cell.fact,
                        plan: cell.plan,
                        rank: 0,
                    },
                ];
            })
            .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name, 'ru'));
        ranked.forEach((entry, i) => {
            const prev = ranked[i - 1];
            entry.rank = prev && prev.percent === entry.percent ? prev.rank : i + 1;
        });
        return {
            indicator,
            entries: ranked.slice(0, RATING_TOP_N),
            participants: ranked.length,
        };
    });

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
