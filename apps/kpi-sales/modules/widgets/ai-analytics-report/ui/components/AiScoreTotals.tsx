'use client';

import {
    AiMetricValue,
    type AiTypeTotals,
} from '@/modules/entities/ai-analytics';

interface AiScoreTotalsProps {
    totals: AiTypeTotals;
}

/** Итог по домену для одного типа: n, менеджеров, оценка. */
export const AiScoreTotals = ({ totals }: AiScoreTotalsProps) => (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
            Итог по домену: n = {totals.n}, менеджеров {totals.managers}
        </span>
        <AiMetricValue metric={totals.score} kind="score" />
    </div>
);
