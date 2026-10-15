'use client';

import { formatPresValue, type PresRatingBoard } from '../lib/presentations-view.util';

interface PresRatingListProps {
    board: PresRatingBoard;
}

/** Top-5 по одному показателю презентаций. */
export const PresRatingList = ({ board }: PresRatingListProps) => {
    const max = board.entries[0]?.value ?? 0;
    return (
        <div className="rounded-md border border-border bg-popover/60 p-3">
            <h4 className="mb-2 text-sm font-semibold">{board.title}</h4>
            {!board.entries.length ? (
                <p className="text-xs text-muted-foreground">Нет данных для рейтинга</p>
            ) : (
                <ol className="space-y-1.5">
                    {board.entries.map(entry => (
                        <li key={entry.userId} className="text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate">
                                    <span className="mr-1 inline-block w-4 text-muted-foreground">{entry.rank}</span>
                                    {entry.name}
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {formatPresValue(entry.value, board.kind)}
                                </span>
                            </div>
                            <div className="mt-0.5 h-1.5 rounded-full bg-muted">
                                <div
                                    className="h-1.5 rounded-full bg-primary/70"
                                    style={{ width: `${max > 0 ? Math.max(4, Math.min(100, Math.round((entry.value / max) * 100))) : 0}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};
