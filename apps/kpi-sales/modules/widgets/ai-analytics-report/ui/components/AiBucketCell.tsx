'use client';

import {
    AiMetricValue,
    type AiBucketScore,
} from '@/modules/entities/ai-analytics';

interface AiBucketCellProps {
    bucket: AiBucketScore | null;
}

/** Оценка корзины (1–10) с n; корзины нет — «—». */
export const AiBucketCell = ({ bucket }: AiBucketCellProps) =>
    bucket ? (
        <div className="flex flex-col items-end">
            <AiMetricValue metric={bucket.score} kind="score" />
            <span className="text-[0.6875rem] text-muted-foreground">
                n = {bucket.n}
            </span>
        </div>
    ) : (
        <span className="text-muted-foreground">—</span>
    );
