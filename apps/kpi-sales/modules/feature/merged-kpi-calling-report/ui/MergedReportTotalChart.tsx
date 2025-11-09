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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface MergedReportTotalChartProps {
    data: RTableProps['data'];
    selectedActions: string[];
}

export const MergedReportTotalChart: React.FC<MergedReportTotalChartProps> = ({
    data,
    selectedActions,
}) => {
    // Вычисляем общие суммы по каждому показателю
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Получаем все уникальные действия
        const allActions = data[0]?.actions.map(action => action.name) || [];
        const actionsToShow = selectedActions.length > 0
            ? allActions.filter(action => selectedActions.includes(action))
            : allActions;

        // Суммируем значения по каждому действию
        const totals = actionsToShow.map(actionName => {
            const total = data.reduce((sum, user) => {
                const action = user.actions.find(a => a.name === actionName);
                return sum + (action?.value || 0);
            }, 0);

            return {
                name: actionName,
                value: total,
            };
        });

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
    }, [data, selectedActions]);

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

