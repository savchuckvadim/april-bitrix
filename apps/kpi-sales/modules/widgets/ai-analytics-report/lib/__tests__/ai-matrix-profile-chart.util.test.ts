import { describe, expect, it } from 'vitest';
import {
    aiMatrixPresentTypes,
    buildAiTypesMatrixFor,
} from '@/modules/entities/ai-analytics/lib/ai-types-matrix.util';
import {
    CALL_TYPES,
    managerName,
    matrixRows,
} from '@/modules/entities/ai-analytics/__tests__/ai-types-matrix-fixtures';
import {
    AI_PROFILE_ALL,
    aiProfileChartData,
    aiProfileChartOptions,
    aiProfileChartTitle,
    aiProfileEntityOptions,
    aiProfileTooltipLabel,
    buildAiProfileChart,
    resolveAiProfileEntity,
} from '../ai-matrix-profile-chart.util';
import { aiMatrixNorms } from '../ai-matrix-view.util';

const matrix = buildAiTypesMatrixFor(
    matrixRows(),
    aiMatrixPresentTypes(matrixRows(), CALL_TYPES),
    { managerName, callTypes: CALL_TYPES, mode: 'types' },
);

describe('выбор сотрудника', () => {
    it('опции: весь состав + сотрудники строк; сохранённый есть — он, иначе состав', () => {
        expect(aiProfileEntityOptions(matrix)).toEqual([
            { value: AI_PROFILE_ALL, label: 'Весь выбранный состав' },
            { value: '7', label: 'Иванов Иван' },
            { value: '3', label: 'Петров Пётр' },
        ]);
        expect(resolveAiProfileEntity('3', matrix)).toBe('3');
        expect(resolveAiProfileEntity('99', matrix)).toBe(AI_PROFILE_ALL);
        expect(resolveAiProfileEntity('', matrix)).toBe(AI_PROFILE_ALL);
    });

    it('один сотрудник в таблице — выбран он', () => {
        const single = buildAiTypesMatrixFor(
            matrixRows(),
            aiMatrixPresentTypes(matrixRows(), CALL_TYPES),
            { managerName, userIds: new Set([3]) },
        );
        expect(resolveAiProfileEntity('', single)).toBe('3');
    });
});

describe('buildAiProfileChart', () => {
    it('весь состав — одна серия среднего по отделу по колонкам-оценкам (без продаж)', () => {
        const chart = buildAiProfileChart(matrix, AI_PROFILE_ALL);
        expect(chart.labels).toEqual(['Холодный', 'Презентация', 'Решение', 'Прочее']);
        expect(chart.series).toHaveLength(1);
        expect(chart.series[0]).toEqual({
            label: 'Среднее по отделу',
            scores: [null, 6.9, 5.5, null],
            n: [3, 37, 9, 2],
        });
        expect(chart.hasScores).toBe(true);
        expect(aiProfileChartTitle(chart, 'типам звонков')).toBe(
            'Оценки по типам звонков: среднее по отделу',
        );
    });

    it('сотрудник — его столбцы первой серией, среднее по отделу второй', () => {
        const chart = buildAiProfileChart(matrix, '3');
        expect(chart.series.map(item => item.label)).toEqual(['Петров Пётр', 'Среднее по отделу']);
        expect(chart.series[0]?.scores).toEqual([null, 7.1, 5.5, null]);
        expect(chart.series[0]?.n).toEqual([0, 25, 9, 0]);
        expect(aiProfileChartTitle(chart, 'типам звонков')).toBe(
            'Оценки по типам звонков: Петров Пётр и среднее по отделу',
        );
        const data = aiProfileChartData(chart);
        expect(data.datasets).toHaveLength(2);
        expect(data.datasets[0]?.data).toEqual([null, 7.1, 5.5, null]);
    });

    it('подсказка точки: оценка из 10, объём, «предварительно» при 8–19; без оценки — прочерк', () => {
        const chart = buildAiProfileChart(matrix, '3');
        expect(aiProfileTooltipLabel(chart, 0, 1)).toBe(
            'Петров Пётр · Презентация: 7,1 из 10 по 25 звонкам',
        );
        expect(aiProfileTooltipLabel(chart, 0, 2)).toBe(
            'Петров Пётр · Решение: 5,5 из 10 по 9 звонкам · предварительно',
        );
        expect(aiProfileTooltipLabel(chart, 0, 0)).toBe('Петров Пётр: —');
        const options = aiProfileChartOptions(chart);
        expect(options.scales?.y).toEqual({ min: 0, max: 10 });
        expect(options.plugins?.legend?.display).toBe(true);
    });

    it('нормы для графика оценок — итоги матрицы по колонкам-оценкам', () => {
        expect([...aiMatrixNorms(matrix).entries()]).toEqual([
            ['cold', null],
            ['presentation', 6.9],
            ['decision', 5.5],
            ['other', null],
        ]);
    });
});
