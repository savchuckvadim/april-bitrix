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
import {
    defaultIndicatorLabeler,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import { ReportData } from '../../model/types/report/report-type';
import { getColors } from '../../lib/colors';
import { getReportTotalColumns } from '../../lib/report-totals.util';

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
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
}

export const KPIReportTotalChart: React.FC<KPIReportTotalChartProps> = ({
    report,
    labelOf = defaultIndicatorLabeler,
}) => {
    const chartData = useMemo(() => {
        // Суммы по каждому показателю (название — выводимое)
        const totals = getReportTotalColumns(report ?? [], labelOf);
        if (!totals.length) {
            return { labels: [], datasets: [] };
        }

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
    }, [report, labelOf]);

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

