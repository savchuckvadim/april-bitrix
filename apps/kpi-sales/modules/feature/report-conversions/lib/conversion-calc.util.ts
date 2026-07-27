import type { RatingDataset } from '@/modules/feature/report-rating';
import type { ConversionMethod } from '../model/conversion.types';

/** Пара показателей одного шага конверсии. */
export interface ConversionStepDef {
    fromCode: string;
    fromName: string;
    toCode: string;
    toName: string;
}

export interface ConversionStep extends ConversionStepDef {
    numerator: number;
    denominator: number;
    /** null при denominator === 0 → рендер '—'. Может быть > 100. */
    percent: number | null;
}

export interface ConversionRow {
    userId: number;
    name: string;
    steps: ConversionStep[];
}

export interface ConversionResult {
    stepDefs: ConversionStepDef[];
    rows: ConversionRow[];
    /** Командный итог: из СУММ числителей/знаменателей (не среднее %). */
    total: ConversionStep[];
    /** Медиана percent по строкам (null-проценты исключаются). */
    median: ConversionStep[];
}

const stepPercent = (numerator: number, denominator: number): number | null =>
    denominator === 0 ? null : (numerator / denominator) * 100;

const medianOf = (values: number[]): number | null => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
        ? sorted[mid]!
        : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

/**
 * Пары шагов по выбранному методу: chain — каждый к предыдущему,
 * fromBase — каждый к первому (базовому).
 */
export const buildStepDefs = (
    dataset: RatingDataset,
    codes: string[],
    method: ConversionMethod,
): ConversionStepDef[] => {
    const nameOf = (code: string) =>
        dataset.actions.find(action => action.code === code)?.name || code;
    const known = codes.filter(code =>
        dataset.actions.some(action => action.code === code),
    );
    if (known.length < 2) return [];
    return known.slice(1).map((toCode, i) => {
        const fromCode = method === 'chain' ? known[i]! : known[0]!;
        return {
            fromCode,
            fromName: nameOf(fromCode),
            toCode,
            toName: nameOf(toCode),
        };
    });
};

/** Основной расчёт конверсий поверх уже отфильтрованного датасета. */
export const buildConversionResult = (
    dataset: RatingDataset,
    codes: string[],
    method: ConversionMethod,
): ConversionResult => {
    const stepDefs = buildStepDefs(dataset, codes, method);

    const rows: ConversionRow[] = dataset.rows.map(row => ({
        userId: row.userId,
        name: row.name,
        steps: stepDefs.map(def => {
            const numerator = row.values[def.toCode] ?? 0;
            const denominator = row.values[def.fromCode] ?? 0;
            return {
                ...def,
                numerator,
                denominator,
                percent: stepPercent(numerator, denominator),
            };
        }),
    }));

    const total: ConversionStep[] = stepDefs.map((def, i) => {
        const numerator = rows.reduce(
            (sum, row) => sum + (row.steps[i]?.numerator ?? 0),
            0,
        );
        const denominator = rows.reduce(
            (sum, row) => sum + (row.steps[i]?.denominator ?? 0),
            0,
        );
        return {
            ...def,
            numerator,
            denominator,
            percent: stepPercent(numerator, denominator),
        };
    });

    const median: ConversionStep[] = stepDefs.map((def, i) => {
        const percents = rows
            .map(row => row.steps[i]?.percent)
            .filter((p): p is number => p !== null && p !== undefined);
        const value = medianOf(percents);
        return {
            ...def,
            numerator: 0,
            denominator: 0,
            percent: value,
        };
    });

    return { stepDefs, rows, total, median };
};

/** Быстрый доступ к шагу по `${userId}:${toCode}` (для ячеек таблиц). */
export const buildConversionCellMap = (
    result: ConversionResult,
): Map<string, ConversionStep> => {
    const map = new Map<string, ConversionStep>();
    result.rows.forEach(row =>
        row.steps.forEach(step =>
            map.set(`${row.userId}:${step.toCode}`, step),
        ),
    );
    return map;
};

/** Медиана по toCode — для раскраски ячеек относительно команды. */
export const buildMedianByCode = (
    result: ConversionResult,
): Map<string, ConversionStep> =>
    new Map(result.median.map(step => [step.toCode, step]));

export const formatPercent = (percent: number | null): string =>
    percent === null
        ? '—'
        : `${(Math.round(percent * 10) / 10).toLocaleString('ru-RU')}%`;
