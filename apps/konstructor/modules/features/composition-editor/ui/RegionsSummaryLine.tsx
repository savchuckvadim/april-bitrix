'use client';

import type { RegionsSummary } from '../lib/regions-summary.util';

export interface RegionsSummaryLineProps {
    summary: RegionsSummary;
}

/** Под региональным блоком: вес регионов и перечень регионов состава. */
export const RegionsSummaryLine = ({ summary }: RegionsSummaryLineProps) => (
    <p className="px-2 pb-1.5 pl-8 text-[0.6875rem] text-muted-foreground">
        Вес регионов: <span className="tabular-nums">{summary.weight}</span>
        {summary.details ? ` · ${summary.details}` : ''}
    </p>
);
