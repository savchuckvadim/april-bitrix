'use client';

import {
    AiMetricValue,
    type AiTypeTotals,
} from '@/modules/entities/ai-analytics';
import { AiCallTypeBadge } from './AiCallTypeBadge';

interface AiTypeTotalsListProps {
    /** Итоги типов к показу: родитель уже отсеял типы без звонков (n = 0). */
    totals: AiTypeTotals[];
}

/**
 * «Итоги по типам» в режиме «все типы»: компактно, чип на тип —
 * тип | n | оценка по домену (порядок справочника, как отдал бэк).
 * Пустой список — ничего не рисуем (все типы без звонков отсеяны).
 */
export const AiTypeTotalsList = ({ totals }: AiTypeTotalsListProps) => {
    if (!totals.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Итоги по типам:</span>
            {totals.map(total => (
                <span
                    key={total.callType}
                    className="inline-flex items-center gap-2 rounded-md border border-border/60 px-2 py-1"
                >
                    <AiCallTypeBadge code={total.callType} />
                    <span className="tabular-nums">n = {total.n}</span>
                    <AiMetricValue metric={total.score} kind="score" />
                </span>
            ))}
        </div>
    );
};
