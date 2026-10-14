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
} from 'chart.js';
import type { HourBucket } from '@/modules/entities/digest';
import { withAlpha } from '../../lib/digest-chart-colors';
import { hourLabels, type TimelineSeries } from '../lib/timeline-series';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface DigestHourlyChartProps {
    buckets: HourBucket[];
    series: TimelineSeries[];
    /** Стек серий (события/план); у звонков — рядом, вторая ось для минут. */
    stacked?: boolean;
    height?: number;
}

/** Почасовой столбчатый график: часы по X, серии — стеком или рядом. */
export const DigestHourlyChart = ({
    buckets,
    series,
    stacked = true,
    height = 220,
}: DigestHourlyChartProps) => {
    const data = useMemo(
        () => ({
            labels: hourLabels(buckets),
            datasets: series.map(item => ({
                label: item.label,
                data: buckets.map(bucket => bucket.values[item.key] ?? 0),
                backgroundColor: withAlpha(item.color, 0.75),
                borderColor: item.color,
                borderWidth: 1,
                borderRadius: 3,
                yAxisID: item.yAxisID ?? 'y',
            })),
        }),
        [buckets, series],
    );

    const dualAxis = series.some(item => item.yAxisID === 'y1');
    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index' as const, intersect: false },
            plugins: { legend: { position: 'top' as const, labels: { boxWidth: 10 } } },
            scales: {
                x: { stacked, grid: { display: false } },
                y: {
                    stacked,
                    beginAtZero: true,
                    ticks: { precision: 0 },
                },
                ...(dualAxis
                    ? {
                          y1: {
                              position: 'right' as const,
                              beginAtZero: true,
                              grid: { drawOnChartArea: false },
                          },
                      }
                    : {}),
            },
        }),
        [stacked, dualAxis],
    );

    return (
        <div style={{ height }}>
            <Bar data={data} options={options} />
        </div>
    );
};
