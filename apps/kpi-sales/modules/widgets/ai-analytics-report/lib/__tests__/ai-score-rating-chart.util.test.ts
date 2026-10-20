import { describe, expect, it } from 'vitest';
import type { AiScoreRatingRow } from '@/modules/entities/ai-analytics/lib/ai-types-matrix-rating.util';
import {
    AI_SCORE_AXIS_MAX,
    AI_SCORE_AXIS_MIN,
    aiScoreChartData,
    aiScoreChartOptions,
    aiScoreChartTitle,
    isAiScoreRatingVisible,
    pickAiScoreIndicator,
} from '../ai-score-rating-chart.util';

const INDICATORS = [
    { code: 'cold', name: 'Холодный' },
    { code: 'presentation', name: 'Презентация' },
];

const RATING: AiScoreRatingRow[] = [
    { name: 'Отдел А', value: 7.1 },
    { name: 'Отдел Б', value: 5.5 },
];

describe('pickAiScoreIndicator', () => {
    it('сохранённый код есть — он; нет или пусто — первый', () => {
        expect(pickAiScoreIndicator(INDICATORS, 'presentation')).toEqual(INDICATORS[1]);
        expect(pickAiScoreIndicator(INDICATORS, 'payment')).toEqual(INDICATORS[0]);
        expect(pickAiScoreIndicator(INDICATORS, '')).toEqual(INDICATORS[0]);
    });

    it('показателей нет — null', () => {
        expect(pickAiScoreIndicator([], 'cold')).toBeNull();
    });
});

describe('isAiScoreRatingVisible', () => {
    it('от двух сущностей — виден; одна — только рядом с нормой; пусто — нет', () => {
        expect(isAiScoreRatingVisible([])).toBe(false);
        expect(isAiScoreRatingVisible(RATING.slice(0, 1))).toBe(false);
        expect(isAiScoreRatingVisible(RATING.slice(0, 1), 6.8)).toBe(true);
        expect(isAiScoreRatingVisible([], 6.8)).toBe(false);
        expect(isAiScoreRatingVisible(RATING)).toBe(true);
    });
});

describe('данные и опции графика', () => {
    it('заголовок — «<Показатель> — средняя оценка»', () => {
        expect(aiScoreChartTitle(INDICATORS[1]!)).toBe('Презентация — средняя оценка');
    });

    it('без нормы — один столбчатый датасет; с нормой — впереди линия среднего по отделу', () => {
        const data = aiScoreChartData(RATING, 'Оценка');
        expect(data.labels).toEqual(['Отдел А', 'Отдел Б']);
        expect(data.datasets).toHaveLength(1);
        expect(data.datasets[0]).toMatchObject({ type: 'bar', label: 'Оценка', data: [7.1, 5.5] });

        const withNorm = aiScoreChartData(RATING, 'Оценка', 6.8);
        expect(withNorm.datasets).toHaveLength(2);
        expect(withNorm.datasets[0]).toMatchObject({
            type: 'line',
            label: 'Среднее по отделу',
            data: [6.8, 6.8],
        });
        expect(withNorm.datasets[1]?.type).toBe('bar');
    });

    it('ось Y зафиксирована 0..10; легенда только при норме; заголовок задан', () => {
        const options = aiScoreChartOptions('Холодный — средняя оценка');
        expect(options.scales?.y).toEqual({ min: AI_SCORE_AXIS_MIN, max: AI_SCORE_AXIS_MAX });
        expect(AI_SCORE_AXIS_MIN).toBe(0);
        expect(AI_SCORE_AXIS_MAX).toBe(10);
        expect(options.plugins?.legend?.display).toBe(false);
        expect(aiScoreChartOptions('x', true).plugins?.legend?.display).toBe(true);
        expect(options.plugins?.title).toEqual({
            display: true,
            text: 'Холодный — средняя оценка',
        });
        expect(options.maintainAspectRatio).toBe(false);
    });
});
