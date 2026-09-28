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
        expect(pickAiScoreIndicator(INDICATORS, 'presentation')).toEqual(
            INDICATORS[1],
        );
        expect(pickAiScoreIndicator(INDICATORS, 'payment')).toEqual(
            INDICATORS[0],
        );
        expect(pickAiScoreIndicator(INDICATORS, '')).toEqual(INDICATORS[0]);
    });

    it('показателей нет — null', () => {
        expect(pickAiScoreIndicator([], 'cold')).toBeNull();
    });
});

describe('isAiScoreRatingVisible', () => {
    it('меньше двух сущностей с оценкой — график скрыт', () => {
        expect(isAiScoreRatingVisible([])).toBe(false);
        expect(isAiScoreRatingVisible(RATING.slice(0, 1))).toBe(false);
        expect(isAiScoreRatingVisible(RATING)).toBe(true);
    });
});

describe('данные и опции графика', () => {
    it('заголовок — «<Показатель> — оценка»', () => {
        expect(aiScoreChartTitle(INDICATORS[1]!)).toBe('Презентация — оценка');
    });

    it('подписи и значения из рейтинга, один датасет', () => {
        const data = aiScoreChartData(RATING, 'Оценка');
        expect(data.labels).toEqual(['Отдел А', 'Отдел Б']);
        expect(data.datasets).toHaveLength(1);
        expect(data.datasets[0]?.data).toEqual([7.1, 5.5]);
        expect(data.datasets[0]?.label).toBe('Оценка');
    });

    it('ось Y зафиксирована 0..10, легенда скрыта, заголовок задан', () => {
        const options = aiScoreChartOptions('Холодный — оценка');
        expect(options.scales?.y).toEqual({
            min: AI_SCORE_AXIS_MIN,
            max: AI_SCORE_AXIS_MAX,
        });
        expect(AI_SCORE_AXIS_MIN).toBe(0);
        expect(AI_SCORE_AXIS_MAX).toBe(10);
        expect(options.plugins?.legend?.display).toBe(false);
        expect(options.plugins?.title).toEqual({
            display: true,
            text: 'Холодный — оценка',
        });
        expect(options.maintainAspectRatio).toBe(false);
    });
});
