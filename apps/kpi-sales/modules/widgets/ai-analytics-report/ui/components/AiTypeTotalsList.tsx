'use client';

import {
    AI_CALL_TYPE_OUTSIDE_SCORE_SHORT,
    AiMetricValue,
    formatAiCallsShort,
    type AiTypeTotals,
} from '@/modules/entities/ai-analytics';
import { AiCallTypeBadge } from './AiCallTypeBadge';

interface AiTypeTotalsListProps {
    /** Итоги типов к показу: родитель уже отсеял типы без звонков. */
    totals: AiTypeTotals[];
    /** Подсказка типа вне средней оценки по коду; null — обычный тип. */
    hintOf?: (code: string) => string | null;
}

/**
 * «Итоги по типам» в режиме «все типы»: компактно, чип на тип —
 * тип | звонков | оценка по порталу (порядок справочника, как отдал бэк).
 * Тип вне средней оценки (приглашение на мероприятие) получает пометку.
 * Пустой список — ничего не рисуем (все типы без звонков отсеяны).
 */
export const AiTypeTotalsList = ({ totals, hintOf }: AiTypeTotalsListProps) => {
    if (!totals.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Итоги по типам:</span>
            {totals.map(total => {
                const hint = hintOf?.(total.callType) ?? null;
                return (
                    <span
                        key={total.callType}
                        className="inline-flex items-center gap-2 rounded-md border border-border/60 px-2 py-1"
                        title={hint ?? undefined}
                    >
                        <AiCallTypeBadge code={total.callType} />
                        <span className="tabular-nums">
                            {formatAiCallsShort(total.n)}
                        </span>
                        <AiMetricValue metric={total.score} kind="score" />
                        {hint && (
                            <span className="italic">
                                {AI_CALL_TYPE_OUTSIDE_SCORE_SHORT}
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
};
