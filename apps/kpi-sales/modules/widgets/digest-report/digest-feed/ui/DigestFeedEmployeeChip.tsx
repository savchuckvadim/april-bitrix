'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { FeedSummary } from '../lib/digest-feed.util';

interface DigestFeedEmployeeChipProps {
    label: string;
    summary: FeedSummary;
    active: boolean;
    onClick: () => void;
}

/** Вкладка сотрудника в ленте: имя и мини-саммари дня. */
export const DigestFeedEmployeeChip = ({
    label,
    summary,
    active,
    onClick,
}: DigestFeedEmployeeChipProps) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
            'flex flex-col items-start rounded-md border px-2 py-1 text-left text-xs transition-colors',
            active
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-popover/60 text-muted-foreground hover:border-primary/60 hover:text-foreground',
        )}
    >
        <span className="font-medium">
            {label}
            <span className="ml-1 font-normal text-muted-foreground">{summary.total}</span>
        </span>
        <span className="flex gap-2 text-[0.6875rem] tabular-nums">
            <span className="text-success" title="Состоялось">
                ✓ {summary.done}
            </span>
            <span className="text-destructive" title="Не состоялось">
                ✕ {summary.notHeld}
            </span>
            <span className="text-warning" title="Перенесено">
                ↻ {summary.postponed}
            </span>
            {summary.planned > 0 && (
                <span className="text-info" title="Новые планы">
                    + {summary.planned}
                </span>
            )}
            {summary.sales > 0 && (
                <span className="font-semibold text-success" title="Продажи">
                    продаж {summary.sales}
                </span>
            )}
            {summary.refusals > 0 && (
                <span className="text-destructive" title="Отказы">
                    отказов {summary.refusals}
                </span>
            )}
        </span>
    </button>
);
