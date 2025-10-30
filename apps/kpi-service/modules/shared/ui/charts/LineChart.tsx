import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

Chart.register(...registerables);

interface LineChartProps {
    data: Array<{
        month: string;
        value: number;
    }>;
    title: string;
    yAxisLabel?: string;
    color?: string;
    height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
    data,
    title,
    yAxisLabel = 'Значение',
    color = '#3b82f6',
    height = 300
}) => {
    const chartData = useMemo(() => ({
        labels: data.map(item => item.month),
        datasets: [
            {
                label: yAxisLabel,
                data: data.map(item => item.value),
                borderColor: color,
                backgroundColor: `${color}20`,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: color,
                pointBorderColor: color,
                pointRadius: 4,
                pointHoverRadius: 6,
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
                    <Line data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
