'use client';

import { formatPlanPercent, formatPlanValue } from '@/modules/feature/plans';
import type { DigestPlanRatingBoard } from '../../lib/digest-plan-fact.util';

interface DigestPlanRatingListProps {
    board: DigestPlanRatingBoard;
}

const barWidth = (percent: number): number =>
    Math.max(4, Math.min(100, Math.round(percent * 100)));

/** Top-5 по выполнению плана руководителя за день по одному показателю. */
export const DigestPlanRatingList = ({ board }: DigestPlanRatingListProps) => {
    const { indicator } = board;
    return (
        <div className="rounded-md border border-border bg-popover/60 p-3">
            <div className="mb-2 flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold">{indicator.displayName}</h4>
                <span className="text-[0.6875rem] text-muted-foreground">
                    с планом: {board.participants}
                </span>
            </div>
            {!board.entries.length ? (
                <p className="text-xs text-muted-foreground">План не задан никому</p>
            ) : (
                <ol className="space-y-1.5">
                    {board.entries.map(entry => (
                        <li key={entry.userId} className="text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate">
                                    <span className="mr-1 inline-block w-4 text-muted-foreground">
                                        {entry.rank}
                                    </span>
                                    {entry.name}
                                </span>
                                <span className="whitespace-nowrap tabular-nums">
                                    <span className="font-semibold">
                                        {formatPlanPercent(entry.percent)}
                                    </span>
                                    <span className="ml-1 text-muted-foreground">
                                        {formatPlanValue(entry.fact, indicator.unit)} /{' '}
                                        {formatPlanValue(entry.plan, indicator.unit)}
                                    </span>
                                </span>
                            </div>
                            <div className="mt-0.5 h-1.5 rounded-full bg-muted">
                                <div
                                    className="h-1.5 rounded-full bg-primary/70"
                                    style={{ width: `${barWidth(entry.percent)}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};
