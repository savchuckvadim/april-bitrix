import type { RTableAction, RTableAnnotation } from '@workspace/april-ui';
import { AI_MATRIX_TEXT } from './ai-matrix.texts';
import {
    AI_MATRIX_TONE_CLASS,
    aiMatrixNormHint,
    aiMatrixTone,
} from './ai-matrix-norm.util';
import {
    aiMetricLowMax,
    aiMetricMinN,
    type AiMetricThresholds,
} from './ai-metric.util';
import { formatAiScore } from './ai-score.util';

/*
 * Представление одной ячейки-оценки матрицы: крупно — оценка («6,4»),
 * мелко — «по 18 звонкам»; при n < 8 — «ещё 4» и «до оценки»; при 8–19 —
 * «предварительно» без цвета; при n ≥ 20 — цвет относительно нормы.
 * Подсказка ячейки — текст бэка (объяснение), иначе «выше / ниже среднего».
 */

/** Числа ячейки-оценки до представления. */
export interface AiMatrixScoreSource {
    /** Разобранных звонков. */
    n: number;
    /** Оценка 1–10; null — нет (мало разборов, старый расчёт, не сложить из частей). */
    score: number | null;
    /** Готовый текст бэка (explanation.text) — в подсказку; null — нет. */
    explanation?: string | null;
    /** Оценка сложена не из всех разборов (часть без оценки) — пометить в подсказке. */
    partial?: boolean;
    /** Ячейка собрана из частей (корзина, «все типы»): без оценки — у частей её нет. */
    composed?: boolean;
    /** Сотрудников в итоге (строка «Итого»); null — не показывать. */
    managers?: number | null;
    /** Крупно «6,8 из 10» вместо «6,8» (строка «Итого»). */
    outOf?: boolean;
}

export interface AiMatrixPresentOptions {
    /** Норма колонки (среднее по отделу); null — цвета не будет. */
    norm?: number | null;
    thresholds?: AiMetricThresholds;
    /** Дата сравнимости — в подсказку «не раньше …» при нехватке разборов. */
    comparableFrom?: string | null;
}

/** Аннотация ячейки с числами для CSV и рейтингов. */
export interface AiMatrixAnnotation extends RTableAnnotation {
    /** Оценка ячейки; null — нет. */
    score: number | null;
    /** Разобранных звонков. */
    n: number;
    /** Сколько разборов не хватает до оценки; 0 — оценка есть или объёма хватает. */
    remaining: number;
}

/** Уровень доверия по объёму: none (< 8), low (8–19), ok. */
export type AiMatrixLevel = 'none' | 'low' | 'ok';

export const aiMatrixLevel = (
    n: number,
    thresholds?: AiMetricThresholds,
): AiMatrixLevel => {
    if (n < aiMetricMinN(thresholds)) return 'none';
    return n < aiMetricLowMax('score', thresholds) ? 'low' : 'ok';
};

/** Представленная ячейка: значение RTable (без code/name) и аннотация. */
export interface AiMatrixPresentedCell {
    action: Pick<RTableAction, 'value' | 'display' | 'className' | 'tooltip'>;
    annotation: AiMatrixAnnotation | null;
}

const joinLines = (lines: readonly (string | null | undefined)[]): string =>
    lines.filter((line): line is string => !!line).join('\n');

const noteWithVolume = (
    note: string | null,
    source: AiMatrixScoreSource,
): string =>
    [
        note,
        AI_MATRIX_TEXT.byCalls(source.n),
        source.managers ? AI_MATRIX_TEXT.managers(source.managers) : null,
    ]
        .filter(Boolean)
        .join(' · ');

/** Ячейка без звонков: прочерк, без аннотации и подсказки. */
const emptyCell = (): AiMatrixPresentedCell => ({
    action: { value: 0, display: AI_MATRIX_TEXT.noCalls },
    annotation: null,
});

/**
 * Ячейка-оценка → значение RTable (value = n для рейтингов и CSV, display —
 * текст) и аннотация-подстрока. Цвет — только при уровне ok и норме.
 */
export const presentAiScoreCell = (
    source: AiMatrixScoreSource,
    {
        norm = null,
        thresholds,
        comparableFrom = null,
    }: AiMatrixPresentOptions = {},
): AiMatrixPresentedCell => {
    if (source.n <= 0) return emptyCell();
    const minN = aiMetricMinN(thresholds);
    const level = aiMatrixLevel(source.n, thresholds);
    const T = AI_MATRIX_TEXT;

    if (level === 'none') {
        const remaining = minN - source.n;
        return {
            action: {
                value: source.n,
                display: T.remaining(remaining),
                tooltip: T.hint.fewData(source.n, minN, comparableFrom),
            },
            annotation: {
                text: noteWithVolume(T.remainingNote, source),
                score: null,
                n: source.n,
                remaining,
            },
        };
    }

    if (source.score === null) {
        const tooltip = source.managers
            ? T.hint.noCellScores(minN)
            : source.composed
              ? T.hint.noPartScores(minN)
              : T.hint.legacy;
        return {
            action: { value: source.n, display: T.noCalls, tooltip },
            annotation: {
                text: noteWithVolume(T.noScore, source),
                score: null,
                n: source.n,
                remaining: 0,
            },
        };
    }

    const tone = level === 'ok' ? aiMatrixTone(source.score, norm) : null;
    const toneClass = tone ? AI_MATRIX_TONE_CLASS[tone] : '';
    const tooltip = joinLines([
        source.explanation,
        source.partial ? T.hint.partialScore : null,
        level === 'low' ? T.hint.low(aiMetricLowMax('score', thresholds)) : null,
        source.explanation ? null : aiMatrixNormHint(tone, norm),
    ]);
    return {
        action: {
            value: source.n,
            display: source.outOf
                ? T.scoreOutOf(source.score)
                : formatAiScore(source.score),
            ...(toneClass ? { className: toneClass } : {}),
            ...(tooltip ? { tooltip } : {}),
        },
        annotation: {
            text: noteWithVolume(level === 'low' ? T.preliminary : null, source),
            score: source.score,
            n: source.n,
            remaining: 0,
        },
    };
};
