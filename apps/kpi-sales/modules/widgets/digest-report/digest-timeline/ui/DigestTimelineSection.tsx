'use client';

import type { HourBucket } from '@/modules/entities/digest';
import { nonEmptySeries, type TimelineSeries, type TimelineView } from '../lib/timeline-series';
import { DigestHourlyChart } from './DigestHourlyChart';
import { DigestHourlyTable } from './DigestHourlyTable';

interface DigestTimelineSectionProps {
    title: string;
    hint: string;
    buckets: HourBucket[];
    series: TimelineSeries[];
    view: TimelineView;
    stacked?: boolean;
    emptyText: string;
}

/** Один почасовой блок: заголовок + график или таблица; пустой — подпись. */
export const DigestTimelineSection = ({
    title,
    hint,
    buckets,
    series,
    view,
    stacked = true,
    emptyText,
}: DigestTimelineSectionProps) => {
    const visibleSeries = nonEmptySeries(series, buckets);
    return (
        <div className="space-y-2">
            <div>
                <h4 className="text-sm font-semibold">{title}</h4>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            {!visibleSeries.length ? (
                <p className="py-4 text-sm text-muted-foreground">{emptyText}</p>
            ) : view === 'chart' ? (
                <DigestHourlyChart buckets={buckets} series={visibleSeries} stacked={stacked} />
            ) : (
                <DigestHourlyTable buckets={buckets} series={visibleSeries} />
            )}
        </div>
    );
};
