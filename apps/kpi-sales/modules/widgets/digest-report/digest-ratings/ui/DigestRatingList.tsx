'use client';

import { HintTooltip } from '@workspace/april-ui';
import {
    formatDigestAverage,
    formatDigestMetric,
} from '@/modules/entities/digest';
import { barWidth, type RatingBoard } from '../lib/ratings.util';

interface DigestRatingListProps {
    board: RatingBoard;
}

/** Top-N по одной метрике с полосками и средними по выборке / по всем. */
export const DigestRatingList = ({ board }: DigestRatingListProps) => {
    const { def } = board;
    return (
        <div className="rounded-md border border-border bg-popover/60 p-3">
            <div className="mb-2 flex items-baseline justify-between gap-2">
                <HintTooltip title={def.label} lines={[def.hint]}>
                    <h4 className="cursor-help text-sm font-semibold">{def.label}</h4>
                </HintTooltip>
                <span className="text-[0.6875rem] text-muted-foreground">
                    Ø выборка {formatDigestAverage(board.avgSelection, def.kind)}
                    {' · '}
                    Ø все {formatDigestAverage(board.avgAll, def.kind)}
                </span>
            </div>
            {!board.entries.length ? (
                <p className="text-xs text-muted-foreground">Нет данных для рейтинга</p>
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
                                <span className="font-semibold tabular-nums">
                                    {formatDigestMetric(entry.value, def.kind)}
                                </span>
                            </div>
                            <div className="mt-0.5 h-1.5 rounded-full bg-muted">
                                <div
                                    className="h-1.5 rounded-full bg-primary/70"
                                    style={{ width: `${barWidth(entry.value, board.max)}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};
