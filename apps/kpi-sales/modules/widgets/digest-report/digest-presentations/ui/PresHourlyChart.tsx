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
import type { DigestPresentation, HourBucket, HourRange } from '@/modules/entities/digest';
import { presHourlyChartData, presTooltipLines } from '../lib/presentations-chart.util';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface PresHourlyChartProps {
    buckets: HourBucket[];
    itemsByHour: DigestPresentation[][];
    range: HourRange;
    nameOf: (userId: number) => string;
}

/**
 * Презентации по часам, стек по статусам. Наведение — компания или лид,
 * статус, сотрудник и что писали при планировании и после отработки.
 */
export const PresHourlyChart = ({ buckets, itemsByHour, range, nameOf }: PresHourlyChartProps) => {
    const chart = useMemo(() => presHourlyChartData(buckets, range), [buckets, range]);
    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index' as const, intersect: false },
            plugins: {
                legend: { position: 'top' as const, labels: { boxWidth: 10 } },
                tooltip: {
                    callbacks: {
                        afterBody: (ctx: TooltipItem<'bar'>[]) => {
                            const hour = chart.hours[ctx[0]?.dataIndex ?? -1];
                            return hour === undefined
                                ? []
                                : presTooltipLines(itemsByHour[hour] ?? [], nameOf);
                        },
                    },
                },
            },
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
            },
        }),
        [chart, itemsByHour, nameOf],
    );

    if (!chart.datasets.length) {
        return <p className="py-3 text-sm text-muted-foreground">Презентаций под фильтры нет</p>;
    }
    return (
        <div style={{ height: 260 }}>
            <Bar data={{ labels: chart.labels, datasets: chart.datasets }} options={options} />
        </div>
    );
};
