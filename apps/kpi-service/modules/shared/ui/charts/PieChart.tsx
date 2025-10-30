import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

Chart.register(...registerables);

interface PieChartProps {
    data: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    title: string;
    height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    height = 300
}) => {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    const chartData = useMemo(() => ({
        labels: data.map(item => item.label),
        datasets: [
            {
                data: data.map(item => item.value),
                backgroundColor: data.map((item, index) => item.color || colors[index % colors.length]),
                borderColor: data.map((item, index) => item.color || colors[index % colors.length]),
                borderWidth: 2,
            }
        ]
    }), [data, colors]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                callbacks: {
                    label: function (context: any) {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed.toLocaleString('ru-RU')} ₽ (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: `${height}px` }}>
                    <Pie data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
