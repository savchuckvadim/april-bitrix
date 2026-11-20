import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import {
    AI_DEAL_MOVEMENT_STATUSES,
    formatAiMoney,
    formatAiMoneyCompact,
    type AiDealMovementNight,
    type AiDealMovementStatus,
} from '@/modules/entities/ai-analytics';
import { aiDmDeals, aiDmNightLabel } from './ai-deal-movement-format.util';

/*
 * График «Динамика по ночам»: линия на каждый статус, по оси — ночи
 * периода. Ночь без итога по отделу (старый счёт при выбранных
 * менеджерах) — разрыв линии, а не ноль. Цвета — токены темы, их
 * значение подставляет компонент (canvas не понимает CSS-переменные).
 */

export const AI_DM_CHART_METRICS = ['count', 'amount'] as const;
export type AiDmChartMetric = (typeof AI_DM_CHART_METRICS)[number];

export const isAiDmChartMetric = (value: string): value is AiDmChartMetric =>
    (AI_DM_CHART_METRICS as readonly string[]).includes(value);

/** График имеет смысл от двух ночей. */
export const AI_DM_CHART_MIN_NIGHTS = 2;

export interface AiDmChartSeries {
    status: AiDealMovementStatus;
    label: string;
    values: (number | null)[];
}

export interface AiDmChartModel {
    labels: string[];
    series: AiDmChartSeries[];
    /** Есть хоть одно значение (иначе — пояснение вместо пустого графика). */
    hasValues: boolean;
}

const nightValue = (
    night: AiDealMovementNight,
    status: AiDealMovementStatus,
    metric: AiDmChartMetric,
): number | null => {
    const cell = night.department?.find(item => item.status === status);
    if (!cell) return null;
    return metric === 'count' ? cell.count : cell.amountSum;
};

/** Ряды графика по ночам; подписи статусов — из ответа сервера. */
export const aiDmNightsChart = (
    nights: readonly AiDealMovementNight[],
    metric: AiDmChartMetric,
    titles: ReadonlyMap<AiDealMovementStatus, string>,
): AiDmChartModel => {
    const series = AI_DEAL_MOVEMENT_STATUSES.map(status => ({
        status,
        label: titles.get(status) ?? '',
        values: nights.map(night => nightValue(night, status, metric)),
    }));
    return {
        labels: nights.map(night => aiDmNightLabel(night.day)),
        series,
        hasValues: series.some(item =>
            item.values.some(value => value !== null),
        ),
    };
};

export type AiDmLineData = ChartData<'line', (number | null)[], string>;

/** Данные chart.js: цвет статуса — по коду через colorOf. */
export const aiDmChartData = (
    model: AiDmChartModel,
    colorOf: (status: AiDealMovementStatus) => string,
): AiDmLineData => ({
    labels: model.labels,
    datasets: model.series.map(item => ({
        label: item.label,
        data: item.values,
        borderColor: colorOf(item.status),
        backgroundColor: colorOf(item.status),
        tension: 0.25,
        pointRadius: 2,
        spanGaps: false,
    })),
});

/** Значение точки в подсказке: «12 сделок» или «1 250 000 ₽». */
export const aiDmChartValueText = (
    metric: AiDmChartMetric,
    value: number,
): string => (metric === 'count' ? aiDmDeals(value) : formatAiMoney(value));

/** Опции: ось от нуля, подписи оси суммы коротко, подсказка словами. */
export const aiDmChartOptions = (
    metric: AiDmChartMetric,
): ChartOptions<'line'> => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { position: 'bottom' },
        tooltip: {
            callbacks: {
                label: (item: TooltipItem<'line'>) =>
                    `${item.dataset.label ?? ''}: ${aiDmChartValueText(metric, item.parsed.y)}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
                callback: (value: number | string) =>
                    metric === 'count'
                        ? String(value)
                        : formatAiMoneyCompact(Number(value)),
            },
        },
    },
});
