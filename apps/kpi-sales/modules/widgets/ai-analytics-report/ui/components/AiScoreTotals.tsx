'use client';

import {
    AiMetricValue,
    formatAiCalls,
    type AiTypeTotals,
} from '@/modules/entities/ai-analytics';

interface AiScoreTotalsProps {
    totals: AiTypeTotals;
}

/** Итог по порталу для одного типа: звонков, менеджеров, оценка. */
export const AiScoreTotals = ({ totals }: AiScoreTotalsProps) => (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
            Итого по порталу: {formatAiCalls(totals.n)}, менеджеров{' '}
            {totals.managers}
        </span>
        <AiMetricValue metric={totals.score} kind="score" />
    </div>
);
