'use client'
import React from 'react';
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

interface MergedReportChartProps {
    data: RTableProps['data'];
    selectedActions: string[];
}

export const MergedReportChart: React.FC<MergedReportChartProps> = ({
    data,
    selectedActions
}) => {
    if (!data || data.length === 0) {
        return null;
    }

    // Получаем все уникальные действия из данных
    const allActions = data[0]?.actions.map(action => action.name) || [];
    const actionsToShow = selectedActions.length > 0
        ? allActions.filter(action => selectedActions.includes(action))
        : allActions;

    // Фильтруем данные по выбранным действиям
    const filteredData = data.map(user => ({
        ...user,
        actions: user.actions.filter(action => actionsToShow.includes(action.name))
    }));

    const labels = filteredData.map(user => user.name);

    // Создаем датасеты для каждого действия
    const datasets = actionsToShow.map((actionName, index) => {
        const dataValues = filteredData.map(user => {
            const action = user.actions.find(a => a.name === actionName);
            return action?.value || 0;
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
            label: actionName,
            data: dataValues,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length]?.replace('0.8', '1') || 'rgb(0, 0, 0)',
            borderWidth: 1,
        };
    });

    const chartData = {
        labels,
        datasets,
    };

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
                text: 'Объединенный отчет KPI и звонков',
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
                <CardTitle>График показателей</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: '400px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

