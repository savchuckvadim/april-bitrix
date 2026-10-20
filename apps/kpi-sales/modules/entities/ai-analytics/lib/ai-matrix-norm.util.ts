import { TONE_TEXT } from '@workspace/april-ui/tones';
import { AI_MATRIX_NORM_DELTA, AI_MATRIX_TEXT } from './ai-matrix.texts';

/*
 * Норма ячейки матрицы — среднее по отделу по той же колонке (итог таблицы:
 * бэк для сводной, взвешенное среднее по строкам для секций отделов и
 * групп). Тон — выше / ниже / около нормы с порогом AI_MATRIX_NORM_DELTA.
 */

export type AiMatrixTone = 'above' | 'below' | 'near';

/** Классы тона значения (реестр тонов april-ui): выше — success, ниже — destructive. */
export const AI_MATRIX_TONE_CLASS: Record<AiMatrixTone, string> = {
    above: TONE_TEXT.success,
    below: TONE_TEXT.destructive,
    near: '',
};

/** Тон оценки относительно нормы; без оценки или нормы — null. */
export const aiMatrixTone = (
    score: number | null,
    norm: number | null | undefined,
    delta: number = AI_MATRIX_NORM_DELTA,
): AiMatrixTone | null => {
    if (score === null || norm === null || norm === undefined) return null;
    const diff = score - norm;
    if (diff > delta) return 'above';
    if (diff < -delta) return 'below';
    return 'near';
};

/** «Выше среднего по отделу (6,8).» — подсказка по тону; без тона — null. */
export const aiMatrixNormHint = (
    tone: AiMatrixTone | null,
    norm: number | null | undefined,
): string | null =>
    tone && norm !== null && norm !== undefined
        ? AI_MATRIX_TEXT.hint.norm[tone](norm)
        : null;

/* ---------- Взвешенное среднее ---------- */

/** Оценка с весом: score = null — оценки нет (n всё равно считается в объём). */
export interface AiWeightedPoint {
    score: number | null;
    n: number;
}

export interface AiWeightedScore {
    /** Σ n по всем точкам (и без оценки тоже). */
    n: number;
    /** Σ(score·n)/Σn по точкам с оценкой, до 0,1; нет ни одной — null. */
    score: number | null;
    /** Σ n только по точкам с оценкой: меньше n — оценка сложена не из всех. */
    scoredN: number;
}

/** До 0,1: 5.75 → 5.8. */
export const roundAiScore = (value: number): number =>
    Math.round(value * 10) / 10;

/** Взвешенное по n среднее оценок; точки с n ≤ 0 не учитываются. */
export const aiWeightedScore = (
    points: readonly AiWeightedPoint[],
): AiWeightedScore => {
    let n = 0;
    let sum = 0;
    let scoredN = 0;
    for (const point of points) {
        if (point.n <= 0) continue;
        n += point.n;
        if (point.score !== null) {
            sum += point.score * point.n;
            scoredN += point.n;
        }
    }
    return {
        n,
        scoredN,
        score: scoredN > 0 ? roundAiScore(sum / scoredN) : null,
    };
};
