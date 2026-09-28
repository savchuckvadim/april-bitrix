import type { ChartData, ChartOptions } from 'chart.js';
import type { AiScoreRatingRow } from '@/modules/entities/ai-analytics/lib/ai-types-matrix-rating.util';
import type { AiScoreIndicator } from './ai-types-matrix-view.util';

/*
 * График «Оценка — отделы / группы / сотрудники» (AiScoreRatingChart):
 * выбор показателя, данные и опции столбчатой диаграммы. Взвешенное
 * среднее считает weightedAiScoreRating сущности — здесь только вид.
 */

/** Шкала оценки разбора 1–10; ось всегда 0..10, чтобы столбцы были сопоставимы. */
export const AI_SCORE_AXIS_MIN = 0;
export const AI_SCORE_AXIS_MAX = 10;
/** Рейтинг из одной сущности сравнивать не с чем — график не показываем. */
export const AI_SCORE_RATING_MIN_ENTITIES = 2;

const AI_SCORE_BAR_COLOR = 'rgba(30, 144, 255, 0.8)';

/** Сохранённый показатель, если он в списке, иначе первый; null — показателей нет. */
export const pickAiScoreIndicator = (
    indicators: AiScoreIndicator[],
    stored: string,
): AiScoreIndicator | null =>
    indicators.find(indicator => indicator.code === stored) ??
    indicators[0] ??
    null;

export const isAiScoreRatingVisible = (
    rating: readonly AiScoreRatingRow[],
): boolean => rating.length >= AI_SCORE_RATING_MIN_ENTITIES;

/** Подзаголовок графика: «Презентация — оценка». */
export const aiScoreChartTitle = (indicator: AiScoreIndicator): string =>
    `${indicator.name} — оценка`;

export const aiScoreChartData = (
    rating: readonly AiScoreRatingRow[],
    label: string,
): ChartData<'bar'> => ({
    labels: rating.map(row => row.name),
    datasets: [
        {
            label,
            data: rating.map(row => row.value),
            backgroundColor: AI_SCORE_BAR_COLOR,
            borderWidth: 1,
        },
    ],
});

export const aiScoreChartOptions = (title: string): ChartOptions<'bar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: { display: true, text: title },
    },
    scales: {
        y: { min: AI_SCORE_AXIS_MIN, max: AI_SCORE_AXIS_MAX },
    },
});
