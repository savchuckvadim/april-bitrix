import type { ChartData, ChartOptions } from 'chart.js';
import type { AiScoreRatingRow } from '@/modules/entities/ai-analytics/lib/ai-types-matrix-rating.util';
import { AI_MATRIX_BLOCK_TEXT } from './ai-matrix-texts';
import type { AiScoreIndicator } from './ai-types-matrix-view.util';

/*
 * График «Средняя оценка — отделы / группы / сотрудники» (AiScoreRatingChart):
 * выбор показателя, данные (столбцы сущностей + линия среднего по отделу)
 * и опции. Взвешенное среднее считает weightedAiScoreRating сущности —
 * здесь только вид.
 */

/** Шкала оценки разбора 1–10; ось всегда 0..10, чтобы столбцы были сопоставимы. */
export const AI_SCORE_AXIS_MIN = 0;
export const AI_SCORE_AXIS_MAX = 10;
/** Рейтинг из одной сущности показываем только рядом с нормой (средним по отделу). */
export const AI_SCORE_RATING_MIN_ENTITIES = 2;

const AI_SCORE_BAR_COLOR = 'rgba(30, 144, 255, 0.8)';
const AI_SCORE_NORM_COLOR = 'rgba(148, 163, 184, 0.9)';

/** Данные смешанного графика: столбцы оценок и линия нормы. */
export type AiScoreChartData = ChartData<'bar' | 'line', (number | null)[], string>;
export type AiScoreChartOptions = ChartOptions<'bar' | 'line'>;

/** Сохранённый показатель, если он в списке, иначе первый; null — показателей нет. */
export const pickAiScoreIndicator = (
    indicators: AiScoreIndicator[],
    stored: string,
): AiScoreIndicator | null =>
    indicators.find(indicator => indicator.code === stored) ??
    indicators[0] ??
    null;

/** График виден от двух сущностей с оценкой либо от одной, когда есть норма. */
export const isAiScoreRatingVisible = (
    rating: readonly AiScoreRatingRow[],
    norm: number | null = null,
): boolean =>
    rating.length >= AI_SCORE_RATING_MIN_ENTITIES ||
    (rating.length === 1 && norm !== null);

/** Подзаголовок графика: «Презентация — средняя оценка». */
export const aiScoreChartTitle = (indicator: AiScoreIndicator): string =>
    AI_MATRIX_BLOCK_TEXT.rating.chartTitle(indicator.name);

/** Столбцы сущностей; при норме — линия среднего по отделу поверх. */
export const aiScoreChartData = (
    rating: readonly AiScoreRatingRow[],
    label: string,
    norm: number | null = null,
): AiScoreChartData => ({
    labels: rating.map(row => row.name),
    datasets: [
        ...(norm === null
            ? []
            : [
                  {
                      type: 'line' as const,
                      label: AI_MATRIX_BLOCK_TEXT.rating.normSeries,
                      data: rating.map(() => norm),
                      borderColor: AI_SCORE_NORM_COLOR,
                      backgroundColor: AI_SCORE_NORM_COLOR,
                      borderDash: [6, 4],
                      pointRadius: 0,
                      borderWidth: 2,
                  },
              ]),
        {
            type: 'bar' as const,
            label,
            data: rating.map(row => row.value),
            backgroundColor: AI_SCORE_BAR_COLOR,
            borderWidth: 1,
        },
    ],
});

export const aiScoreChartOptions = (
    title: string,
    withNorm = false,
): AiScoreChartOptions => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: withNorm },
        title: { display: true, text: title },
    },
    scales: {
        y: { min: AI_SCORE_AXIS_MIN, max: AI_SCORE_AXIS_MAX },
    },
});
