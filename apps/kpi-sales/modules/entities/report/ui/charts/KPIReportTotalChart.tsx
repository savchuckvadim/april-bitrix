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
import { ReportData } from '../../model/types/report/report-type';
import { getColors } from '../../lib/colors';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface KPIReportTotalChartProps {
    report: ReportData[];
}

export const KPIReportTotalChart: React.FC<KPIReportTotalChartProps> = ({
    report,
}) => {
    // Вычисляем общие суммы по каждому показателю
    const chartData = useMemo(() => {
        if (!report || report.length === 0 || !report[0]?.kpi) {
            return { labels: [], datasets: [] };
        }

        // Получаем все уникальные действия из первого отчета
        const allActions = report[0].kpi.map(kpi => ({
            name: kpi.action.name || 'Unknown',
            innerCode: kpi.action.innerCode,
            action: kpi.action,
        }));

        // Суммируем значения по каждому действию
        const totals = allActions.map(action => {
            const total = report.reduce((sum, userReport) => {
                const kpi = userReport.kpi.find(
                    k => k.action.innerCode === action.innerCode
                );
                return sum + (kpi?.count || 0);
            }, 0);

            return {
                name: action.name,
                value: total,
                action: action.action,
            };
        });

        // Получаем цвета для каждого действия
        const colors = getColors(totals.map(t => ({ action: t.action })));

        return {
            labels: ['Итого'],
            datasets: totals.map((item, index) => {
                const bgColor = colors[index] || `rgba(${30 + index * 30}, ${144 + index * 20}, 255, 0.8)`;
                const borderColor = bgColor.includes('0.8')
                    ? bgColor.replace('0.8', '1')
                    : bgColor.includes('rgba')
                        ? bgColor.replace(/,\s*[\d.]+\)$/, ', 1)')
                        : bgColor;

                return {
                    label: item.name,
                    data: [item.value],
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    borderWidth: 1,
                };
            }),
        };
    }, [report]);

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
                text: 'Общие показатели KPI (Итого)',
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
                <CardTitle>График общих показателей KPI</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: '400px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

