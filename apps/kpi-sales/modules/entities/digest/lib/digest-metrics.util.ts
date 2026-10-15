/**
 * Метрики дайджеста: строки по сотрудникам, рейтинги, средние по отделу и
 * по всем, сравнение сотрудника со средними. Чистые функции — покрыты
 * vitest без стора.
 */
import type { StructureSection } from '@/modules/entities/department';
import type {
    DigestCalls,
    DigestCounters,
    DigestEmployee,
    DigestSummary,
} from '../model';
import {
    DIGEST_CALL_TYPE_CODES,
    DIGEST_METRIC_BY_CODE,
    DIGEST_METRICS,
    DigestMetricCode,
} from './digest-catalog';

export type DigestMetricValues = Record<DigestMetricCode, number | null>;

export interface DigestRow {
    userId: number;
    name: string;
    values: DigestMetricValues;
    employee: DigestEmployee;
}

/** Сумма разбивки по кодам звонковых типов. */
export const callTypesTotal = (byType: Record<string, number>): number =>
    DIGEST_CALL_TYPE_CODES.reduce((sum, code) => sum + (byType[code] ?? 0), 0);

const ratio = (numerator: number, denominator: number): number | null =>
    denominator > 0 ? numerator / denominator : null;

const callsValues = (calls: DigestCalls | null) => ({
    callsCount: calls ? calls.callsCount : null,
    airtimeMinutes: calls ? Math.round(calls.airtimeSeconds / 60) : null,
});

/** Значения метрик из счётчиков (сотрудник или сводка). */
export const metricValuesOf = (
    counters: DigestCounters,
    calls: DigestCalls | null,
): DigestMetricValues => {
    // «Просрочено» в отработанное не входит: честных данных о просрочке нет.
    const worked =
        counters.done.total + counters.notHeld.total + counters.postponed.total;
    return {
        plannedAtStart: counters.plannedAtStart.total,
        worked,
        done: counters.done.total,
        notHeld: counters.notHeld.total,
        postponed: counters.postponed.total,
        planned: counters.planned.total,
        plannedBeyond: counters.plannedBeyond.total,
        documents: counters.documents.total,
        sales: counters.sales,
        refusals: counters.refusals,
        resultRate: ratio(counters.done.total, worked),
        planCompletion: ratio(worked, counters.plannedAtStart.total),
        planResultRate: ratio(counters.done.total, counters.plannedAtStart.total),
        ...callsValues(calls),
    };
};

export const buildDigestRows = (employees: readonly DigestEmployee[]): DigestRow[] =>
    employees.map(employee => ({
        userId: employee.userId,
        name: employee.name,
        values: metricValuesOf(employee, employee.calls),
        employee,
    }));

export const filterRowsByUsers = (
    rows: readonly DigestRow[],
    userIds: ReadonlySet<number>,
): DigestRow[] => rows.filter(row => userIds.has(row.userId));

/** Суммарные значения выборки (счётчики складываются, доли — из сумм). */
export const sumRows = (rows: readonly DigestRow[]): DigestMetricValues => {
    const total = emptyMetricValues();
    let hasCalls = false;
    for (const row of rows) {
        for (const metric of DIGEST_METRICS) {
            if (metric.kind === 'percent') continue;
            const value = row.values[metric.code];
            if (value === null) continue;
            if (metric.code === 'callsCount' || metric.code === 'airtimeMinutes') {
                hasCalls = true;
            }
            total[metric.code] = (total[metric.code] ?? 0) + value;
        }
    }
    if (!hasCalls) {
        total.callsCount = null;
        total.airtimeMinutes = null;
    }
    total.resultRate = ratio(total.done ?? 0, total.worked ?? 0);
    total.planCompletion = ratio(total.worked ?? 0, total.plannedAtStart ?? 0);
    total.planResultRate = ratio(total.done ?? 0, total.plannedAtStart ?? 0);
    return total;
};

const emptyMetricValues = (): DigestMetricValues =>
    Object.fromEntries(
        DIGEST_METRICS.map(metric => [metric.code, metric.kind === 'percent' ? null : 0]),
    ) as DigestMetricValues;

// ---------------------------------------------------------------------
// Рейтинги
// ---------------------------------------------------------------------

export interface DigestRankEntry {
    userId: number;
    name: string;
    value: number;
    /** 1 — лучший; равные значения делят место. */
    rank: number;
}

/** База метрики для порога участия (доли считаются от знаменателя). */
const ratingBaseOf = (row: DigestRow, code: DigestMetricCode): number => {
    if (code === 'resultRate') return row.values.worked ?? 0;
    if (code === 'planCompletion' || code === 'planResultRate') {
        return row.values.plannedAtStart ?? 0;
    }
    return 1;
};

/** Рейтинг по метрике: убывание, ничьи делят место, без значений — вне рейтинга. */
export const rankByMetric = (
    rows: readonly DigestRow[],
    code: DigestMetricCode,
): DigestRankEntry[] => {
    const minBase = DIGEST_METRIC_BY_CODE[code].ratingMinBase ?? 0;
    const entries = rows
        .filter(row => row.values[code] !== null && ratingBaseOf(row, code) >= minBase)
        .map(row => ({
            userId: row.userId,
            name: row.name,
            value: row.values[code] as number,
            rank: 0,
        }))
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'ru'));
    entries.forEach((entry, index) => {
        const prev = entries[index - 1];
        entry.rank = prev && prev.value === entry.value ? prev.rank : index + 1;
    });
    return entries;
};

/** Датасет для EntityRatingChart (проценты → 0..100, null → 0). */
export const buildDigestRatingDataset = (
    rows: readonly DigestRow[],
    codes: readonly DigestMetricCode[],
): {
    actions: { code: string; name: string }[];
    rows: { userId: number; name: string; values: Record<string, number> }[];
} => ({
    actions: codes.map(code => ({
        code,
        name: DIGEST_METRIC_BY_CODE[code].label,
    })),
    rows: rows.map(row => ({
        userId: row.userId,
        name: row.name,
        values: Object.fromEntries(
            codes.map(code => {
                const value = row.values[code] ?? 0;
                const isPercent = DIGEST_METRIC_BY_CODE[code].kind === 'percent';
                return [code, isPercent ? Math.round(value * 100) : value];
            }),
        ),
    })),
});

// ---------------------------------------------------------------------
// Средние
// ---------------------------------------------------------------------

export interface DigestAverages {
    /** Ø по сотрудникам секции (отдел/группа), ключ — id секции. */
    bySection: Record<string, DigestMetricValues>;
    /** Ø по текущей выборке. */
    selection: DigestMetricValues;
    /** Ø по всем ответственным портала (summary бэка); null — нет сводки. */
    all: DigestMetricValues | null;
}

/** Ø по строкам: счётчики — на сотрудника, доли — из сумм. */
export const averageOfRows = (rows: readonly DigestRow[]): DigestMetricValues => {
    const total = sumRows(rows);
    const count = rows.length;
    const callsCount = rows.filter(row => row.values.callsCount !== null).length;
    const result = { ...total };
    for (const metric of DIGEST_METRICS) {
        if (metric.kind === 'percent') continue;
        const value = total[metric.code];
        if (value === null) continue;
        const divisor =
            metric.code === 'callsCount' || metric.code === 'airtimeMinutes'
                ? callsCount
                : count;
        result[metric.code] = divisor > 0 ? value / divisor : null;
    }
    return result;
};

/** Ø по всему порталу из сводки бэка. */
export const averageOfSummary = (summary: DigestSummary): DigestMetricValues => {
    const totals = metricValuesOf(summary.totals, summary.calls);
    const result = { ...totals };
    for (const metric of DIGEST_METRICS) {
        if (metric.kind === 'percent') continue;
        const value = totals[metric.code];
        if (value === null) continue;
        const divisor =
            metric.code === 'callsCount' || metric.code === 'airtimeMinutes'
                ? summary.callsUsersCount
                : summary.usersCount;
        result[metric.code] = divisor > 0 ? value / divisor : null;
    }
    return result;
};

export const buildDigestAverages = (
    rows: readonly DigestRow[],
    sections: readonly StructureSection[],
    summary: DigestSummary | null,
): DigestAverages => ({
    bySection: Object.fromEntries(
        sections.map(section => [
            section.id,
            averageOfRows(filterRowsByUsers(rows, new Set(section.userIds))),
        ]),
    ),
    selection: averageOfRows(rows),
    all: summary ? averageOfSummary(summary) : null,
});

/** Секция (отдел), в которой состоит сотрудник. */
export const sectionOfUser = (
    sections: readonly StructureSection[],
    userId: number,
): StructureSection | null =>
    sections.find(section => section.userIds.includes(userId)) ?? null;

export interface DigestComparison {
    code: DigestMetricCode;
    value: number | null;
    dept: number | null;
    all: number | null;
    /** Отклонение от Ø отдела в процентах; null — нет базы. */
    deltaDeptPct: number | null;
    deltaAllPct: number | null;
}

const deltaPct = (value: number | null, base: number | null): number | null =>
    value === null || base === null || base === 0 ? null : ((value - base) / base) * 100;

/** Сравнение сотрудника со средними по его отделу и по всем. */
export const compareToAverages = (
    row: DigestRow,
    averages: DigestAverages,
    sections: readonly StructureSection[],
    codes: readonly DigestMetricCode[],
): DigestComparison[] => {
    const section = sectionOfUser(sections, row.userId);
    const dept = section ? averages.bySection[section.id] : null;
    return codes.map(code => {
        const value = row.values[code];
        const deptAvg = dept ? dept[code] : null;
        const allAvg = averages.all ? averages.all[code] : null;
        return {
            code,
            value,
            dept: deptAvg,
            all: allAvg,
            deltaDeptPct: deltaPct(value, deptAvg),
            deltaAllPct: deltaPct(value, allAvg),
        };
    });
};
