'use client';

import type { SummaryCountView } from '../../../lib/call-reviews-summary.util';

interface CountListProps {
    title: string;
    rows: SummaryCountView[];
    emptyText: string;
}

/** Список «подпись — число» под заголовком; пусто — строка-пояснение. */
export const CountList = ({ title, rows, emptyText }: CountListProps) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium">{title}</h4>
        {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
            <ul className="space-y-1 text-sm">
                {rows.map(row => (
                    <li key={row.key} className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 break-words">{row.label}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">{row.count}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);
