'use client';

import { TONE_TEXT } from '@workspace/april-ui/tones';
import { cn } from '@workspace/ui/lib/utils';
import type { SummaryStatView } from '../../../lib/call-reviews-summary.util';

interface SummaryStatCardProps {
    stat: SummaryStatView;
}

/** Одно число сводки: подпись, значение и пояснение мелко. */
export const SummaryStatCard = ({ stat }: SummaryStatCardProps) => (
    <div className="rounded-md border p-3">
        <div className="text-xs text-muted-foreground">{stat.label}</div>
        <div className={cn('text-2xl font-semibold tabular-nums', stat.tone && TONE_TEXT[stat.tone])}>
            {stat.value}
        </div>
        {stat.hint && <div className="mt-1 text-xs text-muted-foreground">{stat.hint}</div>}
    </div>
);
