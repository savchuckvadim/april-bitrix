import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import type { AiMatrixTable } from '@/modules/entities/ai-analytics/lib/ai-matrix-table.util';
import { aiMatrixLevel } from '@/modules/entities/ai-analytics/lib/ai-matrix-cell.util';
import { AI_SCORE_AXIS_MAX, AI_SCORE_AXIS_MIN } from './ai-score-rating-chart.util';
import { AI_MATRIX_BLOCK_TEXT } from './ai-matrix-texts';

/*
 * График профиля на «Сводном»: по оси X колонки-оценки матрицы (корзины,
 * типы или разделы), столбцы — оценки выбранного сотрудника рядом со
 * средним по отделу (итоги матрицы). Без сотрудника — только среднее.
 * Ось 0..10, в подсказке объём и пометка «предварительно» при 8–19.
 */

/** Значение «весь выбранный состав» в выборе сотрудника. */
export const AI_PROFILE_ALL = 'all';

export interface AiProfileSeries {
    label: string;
    scores: (number | null)[];
    n: number[];
}

export interface AiProfileChart {
    labels: string[];
    series: AiProfileSeries[];
    /** Есть хотя бы одна оценка — иначе график не показываем. */
    hasScores: boolean;
}

export interface AiProfileEntityOption {
    value: string;
    label: string;
}

/** Опции выбора: «весь выбранный состав» + сотрудники строк матрицы. */
export const aiProfileEntityOptions = (
    matrix: AiMatrixTable,
): AiProfileEntityOption[] => [
    { value: AI_PROFILE_ALL, label: AI_MATRIX_BLOCK_TEXT.chart.entityAll },
    ...matrix.table.data.flatMap(row =>
        row.id === undefined ? [] : [{ value: String(row.id), label: row.name }],
    ),
];

/** Выбранный сотрудник: сохранённый, если он в строках; один сотрудник — он; иначе весь состав. */
export const resolveAiProfileEntity = (
    stored: string,
    matrix: AiMatrixTable,
): string => {
    const ids = matrix.table.data.flatMap(row =>
        row.id === undefined ? [] : [String(row.id)],
    );
    if (stored && ids.includes(stored)) return stored;
    if (stored === AI_PROFILE_ALL) return AI_PROFILE_ALL;
    return ids.length === 1 && ids[0] ? ids[0] : AI_PROFILE_ALL;
};

const scoreColumns = (matrix: AiMatrixTable) =>
    matrix.columns.filter(column => !column.plain);

const departmentSeries = (matrix: AiMatrixTable): AiProfileSeries => {
    const columns = scoreColumns(matrix);
    return {
        label: AI_MATRIX_BLOCK_TEXT.chart.departmentSeries,
        scores: columns.map(column => matrix.totals.get(column.code)?.score ?? null),
        n: columns.map(column => matrix.totals.get(column.code)?.n ?? 0),
    };
};

const managerSeries = (
    matrix: AiMatrixTable,
    userId: string,
): AiProfileSeries | null => {
    const row = matrix.table.data.find(item => String(item.id) === userId);
    if (!row) return null;
    const columns = scoreColumns(matrix);
    return {
        label: row.name,
        scores: columns.map(
            column => matrix.annotations.get(`${userId}:${column.code}`)?.score ?? null,
        ),
        n: columns.map(
            column => matrix.annotations.get(`${userId}:${column.code}`)?.n ?? 0,
        ),
    };
};

/** Данные графика: сотрудник (если выбран) и среднее по отделу по колонкам-оценкам. */
export const buildAiProfileChart = (
    matrix: AiMatrixTable,
    entity: string,
): AiProfileChart => {
    const labels = scoreColumns(matrix).map(column => column.name);
    const manager = entity === AI_PROFILE_ALL ? null : managerSeries(matrix, entity);
    const series = [manager, departmentSeries(matrix)].filter(
        (item): item is AiProfileSeries => item !== null,
    );
    return {
        labels,
        series,
        hasScores: series.some(item => item.scores.some(score => score !== null)),
    };
};

/** Заголовок карточки: «Оценки по корзинам звонков: Имя и среднее по отделу». */
export const aiProfileChartTitle = (
    chart: AiProfileChart,
    columnsLabel: string,
): string =>
    AI_MATRIX_BLOCK_TEXT.chart.title(
        chart.series.length > 1 ? (chart.series[0]?.label ?? null) : null,
        columnsLabel,
    );

const MANAGER_COLOR = 'rgba(30, 144, 255, 0.8)';
const DEPARTMENT_COLOR = 'rgba(148, 163, 184, 0.7)';

export const aiProfileChartData = (chart: AiProfileChart): ChartData<'bar'> => ({
    labels: chart.labels,
    datasets: chart.series.map((item, index) => ({
        label: item.label,
        data: item.scores,
        backgroundColor:
            chart.series.length > 1 && index === 0 ? MANAGER_COLOR : DEPARTMENT_COLOR,
        borderWidth: 1,
    })),
});

/** Подпись точки подсказки: «Презентация: 6,4 из 10 по 18 звонкам · предварительно». */
export const aiProfileTooltipLabel = (
    chart: AiProfileChart,
    datasetIndex: number,
    pointIndex: number,
): string => {
    const series = chart.series[datasetIndex];
    const label = chart.labels[pointIndex] ?? '';
    const score = series?.scores[pointIndex] ?? null;
    const n = series?.n[pointIndex] ?? 0;
    if (!series || score === null) return `${series?.label ?? ''}: —`;
    return `${series.label} · ${AI_MATRIX_BLOCK_TEXT.chart.tooltip(
        label,
        score,
        n,
        aiMatrixLevel(n) === 'low',
    )}`;
};

export const aiProfileChartOptions = (
    chart: AiProfileChart,
): ChartOptions<'bar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: chart.series.length > 1 },
        tooltip: {
            callbacks: {
                label: (item: TooltipItem<'bar'>) =>
                    aiProfileTooltipLabel(chart, item.datasetIndex, item.dataIndex),
            },
        },
    },
    scales: {
        y: { min: AI_SCORE_AXIS_MIN, max: AI_SCORE_AXIS_MAX },
    },
});
