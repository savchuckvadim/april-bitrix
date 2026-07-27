'use client';

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    buildMonthBuckets,
    formatMoney,
    formatMoneyCompact,
    type FinanceClosedReport,
} from '@/modules/entities/finance';
import { resolveFinanceColor } from '../../lib/finance-colors';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

interface FinanceMonthlyLineChartProps {
    report: FinanceClosedReport;
    comparisonReport?: FinanceClosedReport | null;
    comparisonLabel?: string;
}

/** Динамика месячной суммы по месяцам закрытия (+ период сравнения). */
export const FinanceMonthlyLineChart: React.FC<
    FinanceMonthlyLineChartProps
> = ({ report, comparisonReport, comparisonLabel }) => {
    const buckets = useMemo(() => buildMonthBuckets(report), [report]);
    const comparisonBuckets = useMemo(
        () =>
            comparisonReport ? buildMonthBuckets(comparisonReport) : [],
        [comparisonReport],
    );

    /**
     * Основной и сравнительный периоды выровнены по ПОРЯДКОВОМУ индексу
     * месяца внутри периода (1-й месяц против 1-го и т.д.) — периоды
     * равной длины, но с разными календарными месяцами, поэтому единой
     * календарной оси быть не может. Подпись — из более длинного периода.
     */
    const axis = useMemo(() => {
        const length = Math.max(buckets.length, comparisonBuckets.length);
        const labels: string[] = [];
        for (let i = 0; i < length; i++) {
            const main = buckets[i]?.label;
            const cmp = comparisonBuckets[i]?.label;
            labels.push(
                main && cmp && main !== cmp
                    ? `${main} / ${cmp}`
                    : (main ?? cmp ?? `Месяц ${i + 1}`),
            );
        }
        return labels;
    }, [buckets, comparisonBuckets]);

    if (buckets.length < 2 && comparisonBuckets.length < 2) return null;

    const datasets = [
        {
            label: 'Месячная сумма',
            data: axis.map((_l, i) => buckets[i]?.monthlyAmount ?? null),
            borderColor: resolveFinanceColor('--finance-monthly'),
            backgroundColor: resolveFinanceColor('--finance-monthly'),
            tension: 0.3,
        },
    ];

    if (comparisonBuckets.length) {
        datasets.push({
            label: comparisonLabel || 'Период сравнения',
            data: axis.map(
                (_l, i) => comparisonBuckets[i]?.monthlyAmount ?? null,
            ),
            borderColor: resolveFinanceColor('--finance-potential'),
            backgroundColor: resolveFinanceColor('--finance-potential'),
            tension: 0.3,
            borderDash: [6, 4],
        } as (typeof datasets)[number] & { borderDash: number[] });
    }

    const chartData = { labels: axis, datasets };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: comparisonBuckets.length > 0 },
            tooltip: {
                callbacks: {
                    label: (ctx: { parsed: { y: number } }) =>
                        formatMoney(ctx.parsed.y),
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number | string) =>
                        formatMoneyCompact(Number(value)),
                },
            },
        },
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Динамика по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: '320px' }}>
                    <Line data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
