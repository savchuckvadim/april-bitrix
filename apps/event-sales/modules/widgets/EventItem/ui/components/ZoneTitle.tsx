'use client';

import { FC, ReactNode } from 'react';

/**
 * Легенда зоны формы («Отчёт» / «План»): точка в цвете текущего типа
 * события (var(--event-current) берётся из ближайшего data-event-type,
 * поэтому зона Плана красится в цвет планируемого типа, а Отчёта — текущего).
 */
export const ZoneTitle: FC<{ children: ReactNode }> = ({ children }) => (
    <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--event-current)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {children}
        </span>
    </div>
);
