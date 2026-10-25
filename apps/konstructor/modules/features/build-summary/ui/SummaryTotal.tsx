'use client';

import type { SummaryTotal as SummaryTotalData } from '../lib/build-summary.util';

export interface SummaryTotalProps {
    total: SummaryTotalData | null;
}

/** Итог основного набора крупно: сумма, сколько наименований, НДС. */
export const SummaryTotal = ({ total }: SummaryTotalProps) => {
    if (!total) return null;

    return (
        <div className="flex flex-col gap-0.5 border-t pt-3">
            <span className="text-xs text-muted-foreground">
                Общая стоимость · наименований: {total.itemsCount}
            </span>
            <span className="text-2xl font-semibold text-complect-current tabular-nums">
                {total.sum}
            </span>
            {total.note ? (
                <span className="text-xs text-muted-foreground">{total.note}</span>
            ) : null}
        </div>
    );
};
