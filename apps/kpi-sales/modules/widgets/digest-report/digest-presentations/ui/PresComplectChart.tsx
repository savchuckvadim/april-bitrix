'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
    type TooltipItem,
} from 'chart.js';
import type { ComplectStat } from '@/modules/entities/digest';
import { complectChartData } from '../lib/presentations-chart.util';
import { formatPresValue } from '../lib/presentations-view.util';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface PresComplectChartProps {
    stats: ComplectStat[];
}

/** Комплекты проведённых презентаций: количество, в тултипе — сумма. */
export const PresComplectChart = ({ stats }: PresComplectChartProps) => {
    const data = useMemo(() => complectChartData(stats), [stats]);
    const options = useMemo(
        () => ({
            indexAxis: 'y' as const,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: (ctx: TooltipItem<'bar'>) =>
                            `Сумма: ${formatPresValue(stats[ctx.dataIndex]?.sum ?? 0, 'money')}`,
                    },
                },
            },
            scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
        }),
        [stats],
    );

    if (!stats.length) {
        return (
            <p className="py-3 text-sm text-muted-foreground">
                У проведённых презентаций дня комплект не указан
            </p>
        );
    }
    return (
        <div style={{ height: Math.max(140, stats.length * 34) }}>
            <Bar data={data} options={options} />
        </div>
    );
};
