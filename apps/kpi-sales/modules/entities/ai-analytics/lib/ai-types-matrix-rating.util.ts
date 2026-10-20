import type { AiMatrixColumn, AiMatrixTable } from './ai-matrix-table.util';
import { roundAiScore } from './ai-matrix-norm.util';

/*
 * Рейтинги матриц AI. Счётчики — датасет в форме RatingDataset фичи
 * report-rating (EntityRatingChart / RatingFooter суммируют по сотрудникам
 * и секциям). Оценки суммировать нельзя — для них точки {score, n} и
 * взвешенное среднее Σ(score·n)/Σn (AiScoreRatingChart). Источник обоих —
 * уже собранная матрица: value ячейки = число разборов, аннотация — оценка.
 */

export interface AiRatingAction {
    code: string;
    name: string;
}

export interface AiRatingDatasetRow {
    userId: number;
    name: string;
    values: Record<string, number>;
}

/** Структурно совпадает с RatingDataset (feature/report-rating): entity фичу не импортирует. */
export interface AiRatingDataset {
    actions: AiRatingAction[];
    rows: AiRatingDatasetRow[];
}

/**
 * Порог порядкового сравнения людей — зеркало реестра бэка
 * (registry.thresholds.const n_min_rating = 50): меньше — порядок в рейтинге
 * предварительный. В ответах бэка порога нет.
 */
export const AI_RATING_MIN_N = 50;

export const AI_TYPE_COUNT_SUFFIX = ' — разборов';
export const AI_SECTION_COUNT_SUFFIX = ' — оценённых звонков';

/** Подпись показателя-счётчика: колонки-числа как есть, оценки — с суффиксом. */
export const aiCountActionName = (
    column: AiMatrixColumn,
    suffix: string,
): string => (column.plain ? column.name : `${column.name}${suffix}`);

/** Матрица → датасет рейтингов по счётчикам (value ячеек = число разборов). */
export const buildAiMatrixCountDataset = (
    matrix: AiMatrixTable,
    suffix: string,
): AiRatingDataset => ({
    actions: matrix.columns.map(column => ({
        code: column.code,
        name: aiCountActionName(column, suffix),
    })),
    rows: matrix.table.data.map(row => ({
        userId: row.id ?? 0,
        name: row.name,
        values: Object.fromEntries(
            row.actions.map(action => [
                action.code ?? action.name,
                action.value,
            ]),
        ),
    })),
});

/* ---------- Оценки: точки и взвешенное среднее ---------- */

/** Оценка показателя code у сотрудника с весом n; score = null — оценки нет. */
export interface AiScoreRatingPoint {
    userId: number;
    name: string;
    code: string;
    score: number | null;
    n: number;
}

export interface AiScoreRatingRow {
    name: string;
    value: number;
}

/** Сущность рейтинга по секциям (отдел/группа); StructureSection подходит структурно. */
export interface AiScoreRatingGroup {
    name: string;
    userIds: readonly number[];
}

/** Точки оценок по колонкам-оценкам матрицы (ячейки со звонками). */
export const buildAiMatrixScorePoints = (
    matrix: AiMatrixTable,
): AiScoreRatingPoint[] =>
    matrix.table.data.flatMap(row =>
        matrix.columns.flatMap(column => {
            if (column.plain || row.id === undefined) return [];
            const annotation = matrix.annotations.get(`${row.id}:${column.code}`);
            if (!annotation) return [];
            return [
                {
                    userId: row.id,
                    name: row.name,
                    code: column.code,
                    score: annotation.score,
                    n: annotation.n,
                },
            ];
        }),
    );

type ScoredPoint = AiScoreRatingPoint & { score: number };

const isScored = (
    point: AiScoreRatingPoint,
    code: string,
): point is ScoredPoint =>
    point.code === code && point.score !== null && point.n > 0;

interface WeightedAcc {
    name: string;
    sum: number;
    n: number;
}

/**
 * Рейтинг по оценке показателя code: взвешенное по n среднее Σ(score·n)/Σn
 * по точкам со score ≠ null и n > 0. Без groups — по сотрудникам; с groups
 * (отделы/группы) — по сущностям с их userIds. Сущности без единой оценки
 * опущены; сортировка по убыванию.
 */
export const weightedAiScoreRating = (
    points: readonly AiScoreRatingPoint[],
    code: string,
    groups?: readonly AiScoreRatingGroup[],
): AiScoreRatingRow[] => {
    const scored = points.filter((item): item is ScoredPoint =>
        isScored(item, code),
    );
    const accs = new Map<string, WeightedAcc>();
    const add = (key: string, name: string, item: ScoredPoint): void => {
        const acc = accs.get(key) ?? { name, sum: 0, n: 0 };
        acc.sum += item.score * item.n;
        acc.n += item.n;
        accs.set(key, acc);
    };
    if (groups) {
        groups.forEach((group, index) => {
            for (const item of scored) {
                if (group.userIds.includes(item.userId))
                    add(`group:${index}`, group.name, item);
            }
        });
    } else {
        for (const item of scored) add(String(item.userId), item.name, item);
    }
    return [...accs.values()]
        .map(acc => ({ name: acc.name, value: roundAiScore(acc.sum / acc.n) }))
        .sort((a, b) => b.value - a.value);
};

/** Σ n по точкам с оценкой показателя code — объём, на котором стоит рейтинг. */
export const aiScoreRatingVolume = (
    points: readonly AiScoreRatingPoint[],
    code: string,
): number =>
    points
        .filter((item): item is ScoredPoint => isScored(item, code))
        .reduce((sum, item) => sum + item.n, 0);

/** Порядок в рейтинге людей предварительный: разборов меньше AI_RATING_MIN_N. */
export const isAiRatingPreliminary = (
    volume: number,
    minN: number = AI_RATING_MIN_N,
): boolean => volume < minN;
