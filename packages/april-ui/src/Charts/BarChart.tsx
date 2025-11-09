import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

Chart.register(...registerables);

interface BarChartProps {
    data: Array<{
        month: string;
        value: number;
    }>;
    title: string;
    yAxisLabel?: string;
    color?: string;
    height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
    data,
    title,
    yAxisLabel = 'Значение',
    color = '#10b981',
    height = 300
}) => {
    const chartData = useMemo(() => ({
        labels: data.map(item => item.month),
        datasets: [
            {
                label: yAxisLabel,
                data: data.map(item => item.value),
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
    }), [data, yAxisLabel, color]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: color,
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        return `${yAxisLabel}: ${context.parsed.y.toLocaleString('ru-RU')} ₽`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    callback: function (value: any) {
                        return `${value.toLocaleString('ru-RU')} ₽`;
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: `${height}px` }}>
                    <Bar data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
