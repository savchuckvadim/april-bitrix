'use client'
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { RTableProps } from '@/modules/shared';
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import { getMergedTotalColumns } from '../lib/merged-labels.util';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface MergedReportTotalChartProps {
    /** Строки объединённой таблицы с ИСХОДНЫМИ названиями колонок. */
    data: RTableProps['data'];
    /** Выбор колонок по исходным названиям; пусто — все. */
    selectedActions: string[];
    /** Выводимые названия колонок (подписи наборов). */
    labelOf: IndicatorLabeler;
}

export const MergedReportTotalChart: React.FC<MergedReportTotalChartProps> = ({
    data,
    selectedActions,
    labelOf,
}) => {
    const chartData = useMemo(() => {
        // Суммы по выбранным колонкам (название — выводимое)
        const totals = getMergedTotalColumns(data ?? [], selectedActions, labelOf);
        if (!totals.length) {
            return { labels: [], datasets: [] };
        }

        // Генерируем цвета для каждого действия
        const colors = [
            'rgba(30, 144, 255, 0.8)',   // Синий
            'rgba(255, 140, 0, 0.8)',    // Оранжевый
            'rgba(35, 186, 35, 0.8)',    // Зеленый
            'rgba(255, 96, 85, 0.8)',    // Красный
            'rgba(202, 176, 255, 0.8)',  // Фиолетовый
            'rgba(106, 180, 242, 0.8)',  // Голубой
            'rgba(255, 215, 0, 0.8)',    // Золотой
            'rgba(68, 213, 144, 0.8)',   // Мятный
        ];

        return {
            labels: ['Итого'],
            datasets: totals.map((item, index) => ({
                label: item.name,
                data: [item.value],
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length]?.replace('0.8', '1') || 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            })),
        };
    }, [data, selectedActions, labelOf]);

    if (!chartData.labels.length || !chartData.datasets.length) {
        return null;
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Общие показатели (Итого)',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>График общих показателей</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: '400px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

