'use client';

import { HintTooltip, TONE_BG } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    formatAiCount,
    type AiDealMovementStatusCell,
} from '@/modules/entities/ai-analytics';
import {
    aiDmAmountShort,
    aiDmCountWithSum,
} from '../../lib/deal-movement/ai-deal-movement-format.util';
import { AI_DM_STATUS_TONE } from '../../lib/deal-movement/ai-deal-movement-status.util';

interface AiDmStatusCardProps {
    cell: AiDealMovementStatusCell;
}

/** Карточка статуса отдела: подпись с сервера, число сделок и сумма. */
export const AiDmStatusCard = ({ cell }: AiDmStatusCardProps) => (
    <HintTooltip title={cell.title} lines={[aiDmCountWithSum(cell.count, cell.amountSum)]}>
        <div className="rounded-lg border bg-card/60 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span
                    aria-hidden
                    className={cn(
                        'size-2 shrink-0 rounded-full',
                        TONE_BG[AI_DM_STATUS_TONE[cell.status]],
                    )}
                />
                {cell.title}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatAiCount(cell.count)}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
                {aiDmAmountShort(cell.amountSum)}
            </p>
        </div>
    </HintTooltip>
);
