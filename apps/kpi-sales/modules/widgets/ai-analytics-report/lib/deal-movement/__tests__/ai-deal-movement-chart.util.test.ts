import { describe, expect, it } from 'vitest';
import {
    aiDmChartData,
    aiDmChartOptions,
    aiDmChartValueText,
    aiDmNightsChart,
    isAiDmChartMetric,
} from '../ai-deal-movement-chart.util';
import { aiDmStatusTitles } from '../ai-deal-movement-status.util';
import { cell, departmentCells, night } from './ai-deal-movement.fixtures';

const titles = aiDmStatusTitles(departmentCells());

describe('ai-deal-movement-chart — динамика по ночам', () => {
    const nights = [
        night('2026-11-18', [cell('stuck', 5, null), cell('moving', 30, null)]),
        night('2026-11-19', null),
        night('2026-11-20', [cell('stuck', 7, 700_000), cell('moving', 28, 2_800_000)]),
    ];

    it('ряд на каждый статус с подписью сервера, ночь без итога — разрыв', () => {
        const model = aiDmNightsChart(nights, 'count', titles);
        expect(model.labels).toEqual(['18.11', '19.11', '20.11']);
        expect(model.series).toHaveLength(5);
        const stuck = model.series.find(item => item.status === 'stuck');
        expect(stuck?.label).toBe('Без продвижения');
        expect(stuck?.values).toEqual([5, null, 7]);
        // Статуса нет в ячейках ночи — тоже разрыв, а не ноль.
        const rolledBack = model.series.find(item => item.status === 'rolled_back');
        expect(rolledBack?.values).toEqual([null, null, null]);
        expect(model.hasValues).toBe(true);
    });

    it('суммы: ночи без сумм — разрыв; совсем без сумм — пусто', () => {
        const model = aiDmNightsChart(nights, 'amount', titles);
        expect(model.series.find(item => item.status === 'moving')?.values).toEqual([
            null,
            null,
            2_800_000,
        ]);
        expect(aiDmNightsChart(nights.slice(0, 2), 'amount', titles).hasValues).toBe(false);
    });

    it('данные chart.js: цвет статуса через переданную функцию', () => {
        const data = aiDmChartData(aiDmNightsChart(nights, 'count', titles), status => `c-${status}`);
        expect(data.labels).toEqual(['18.11', '19.11', '20.11']);
        expect(data.datasets[2]?.borderColor).toBe('c-stuck');
        expect(data.datasets[2]?.data).toEqual([5, null, 7]);
    });

    it('подсказка точки словами, ось сумм — коротко', () => {
        expect(aiDmChartValueText('count', 12)).toBe('12 сделок');
        expect(aiDmChartValueText('amount', 1_250_000).replace(/[\u00a0\u202f]/g, ' ')).toBe(
            '1 250 000 ₽',
        );
        expect(aiDmChartOptions('count')).toMatchObject({ scales: { y: { beginAtZero: true } } });
    });

    it('переключатель знает только «сделки» и «сумму»', () => {
        expect(isAiDmChartMetric('count')).toBe(true);
        expect(isAiDmChartMetric('amount')).toBe(true);
        expect(isAiDmChartMetric('nope')).toBe(false);
    });
});
