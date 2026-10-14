import {
    DIGEST_COMPARE_METRICS,
    DIGEST_METRIC_BY_CODE,
    DIGEST_RATING_METRICS,
    type DigestAverages,
    type DigestComparison,
    type DigestMetricCode,
    type DigestMetricDef,
    type DigestRankEntry,
    type DigestRow,
    compareToAverages,
    rankByMetric,
    sectionOfUser,
} from '@/modules/entities/digest';
import type { StructureSection } from '@/modules/entities/department';

export const RATING_TOP_N = 5;

export interface RatingBoard {
    def: DigestMetricDef;
    entries: DigestRankEntry[];
    /** Максимум в рейтинге — база для полосок. */
    max: number;
    avgSelection: number | null;
    avgAll: number | null;
    /** Сколько сотрудников участвует (после порога базы). */
    participants: number;
}

export const buildRatingBoards = (
    rows: readonly DigestRow[],
    averages: DigestAverages,
): RatingBoard[] =>
    DIGEST_RATING_METRICS.map(code => {
        const ranked = rankByMetric(rows, code);
        return {
            def: DIGEST_METRIC_BY_CODE[code],
            entries: ranked.slice(0, RATING_TOP_N),
            max: ranked[0]?.value ?? 0,
            avgSelection: averages.selection[code],
            avgAll: averages.all?.[code] ?? null,
            participants: ranked.length,
        };
    });

/** Метрики, где меньше — лучше (цвет дельты инвертируется). */
const LOWER_IS_BETTER = new Set<DigestMetricCode>(['notHeld', 'postponed', 'expired']);

export type DeltaTone = 'success' | 'destructive' | 'muted';

/** Тон отклонения от среднего: ≥ +15% хорошо, ≤ −30% плохо. */
export const deltaTone = (code: DigestMetricCode, deltaPct: number | null): DeltaTone => {
    if (deltaPct === null) return 'muted';
    const normalized = LOWER_IS_BETTER.has(code) ? -deltaPct : deltaPct;
    if (normalized >= 15) return 'success';
    if (normalized <= -30) return 'destructive';
    return 'muted';
};

export interface EmployeeComparison {
    row: DigestRow;
    deptName: string | null;
    items: DigestComparison[];
}

export const buildComparison = (
    row: DigestRow | null,
    averages: DigestAverages,
    sections: readonly StructureSection[],
): EmployeeComparison | null => {
    if (!row) return null;
    return {
        row,
        deptName: sectionOfUser(sections, row.userId)?.name ?? null,
        items: compareToAverages(row, averages, sections, DIGEST_COMPARE_METRICS),
    };
};

/** Ширина полоски рейтинга в процентах от максимума. */
export const barWidth = (value: number, max: number): number =>
    max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
