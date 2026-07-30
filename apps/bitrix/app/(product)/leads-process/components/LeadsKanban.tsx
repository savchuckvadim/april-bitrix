import React from 'react';
import { LeadsKanbanColumn } from '../constants/types';

interface LeadsKanbanProps {
    columns: LeadsKanbanColumn[];
}

/** Фазы процесса колонками — в стиле канбана стадий Битрикс24. */
export const LeadsKanban: React.FC<LeadsKanbanProps> = ({ columns }) => (
    <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((column) => (
            <div
                key={column.title}
                className="flex min-w-60 flex-1 flex-col overflow-hidden rounded-xl border bg-card"
            >
                <div className={`h-1.5 ${column.accentClass}`} />
                <div className="p-4">
                    <h3 className="font-semibold text-foreground">
                        {column.title}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {column.actor}
                    </p>
                    <ul className="mt-3 space-y-2">
                        {column.items.map((item) => (
                            <li
                                key={item}
                                className="rounded-md bg-muted/40 px-3 py-2 text-xs leading-snug text-foreground/90"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ))}
    </div>
);
