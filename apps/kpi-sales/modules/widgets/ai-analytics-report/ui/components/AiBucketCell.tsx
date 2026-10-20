'use client';

import {
    AiMetricValue,
    formatAiCallsShort,
    isAiMetricHidden,
    type AiBucketScore,
} from '@/modules/entities/ai-analytics';

interface AiBucketCellProps {
    bucket: AiBucketScore | null;
}

/**
 * Оценка корзины (1–10) с объёмом «18 зв.»; корзины нет — «—». Когда оценка
 * скрыта, число звонков уже в бэйдже «мало данных: N звонков» — второй раз
 * не пишем.
 */
export const AiBucketCell = ({ bucket }: AiBucketCellProps) =>
    bucket ? (
        <div className="flex flex-col items-end">
            <AiMetricValue metric={bucket.score} kind="score" />
            {!isAiMetricHidden(bucket.score) && (
                <span className="text-[0.6875rem] text-muted-foreground">
                    {formatAiCallsShort(bucket.n)}
                </span>
            )}
        </div>
    ) : (
        <span className="text-muted-foreground">—</span>
    );
