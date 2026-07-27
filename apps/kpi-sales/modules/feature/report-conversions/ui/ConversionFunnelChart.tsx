'use client';

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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import type { RatingDataset } from '@/modules/feature/report-rating';
import type { ConversionMethod } from '../model/conversion.types';
import { buildStepDefs, formatPercent } from '../lib/conversion-calc.util';
import { resolveConversionColor } from '../lib/conversion-colors.util';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface ConversionFunnelChartProps {
    dataset: RatingDataset;
    codes: string[];
    method: ConversionMethod;
    title?: string;
}

/**
 * Воронка конверсии: бары — суммарные значения показателей цепочки по
 * команде, подписи — % шага (к предыдущему или к базе по методу).
 * Цвета баров — единый резолвер conversion-colors.util (токен показателя
 * --kpi-action-*, фолбэк --chart-N) — совпадают с полосой и легендой.
 */
export const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({
    dataset,
    codes,
    method,
    title = 'Воронка конверсии',
}) => {
    const funnel = useMemo(() => {
        const known = codes.filter(code =>
            dataset.actions.some(action => action.code === code),
        );
        const stepDefs = buildStepDefs(dataset, codes, method);
        const totals = known.map(code =>
            dataset.rows.reduce(
                (sum, row) => sum + (row.values[code] ?? 0),
                0,
            ),
        );
        const nameOf = (code: string) =>
            dataset.actions.find(action => action.code === code)?.name || code;
        const labels = known.map((code, i) => {
            if (i === 0) return nameOf(code);
            const def = stepDefs[i - 1];
            const denomIndex =
                def === undefined
                    ? 0
                    : known.indexOf(def.fromCode);
            const denominator = totals[denomIndex] ?? 0;
            const percent =
                denominator === 0
                    ? null
                    : ((totals[i] ?? 0) / denominator) * 100;
            return `${nameOf(code)} — ${formatPercent(percent)}`;
        });
        return { labels, totals, known };
    }, [dataset, codes, method]);

    if (funnel.totals.length < 2) return null;

    const chartData = {
        labels: funnel.labels,
        datasets: [
            {
                label: 'Всего по команде',
                data: funnel.totals,
                backgroundColor: funnel.known.map((code, i) =>
                    resolveConversionColor(code, i),
                ),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: { beginAtZero: true },
        },
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: `${80 + funnel.totals.length * 48}px` }}>
                    <Bar data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
