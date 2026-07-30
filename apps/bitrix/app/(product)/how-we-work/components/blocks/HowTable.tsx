import React from 'react';
import { renderInline } from '../../lib/render-inline';

interface HowTableProps {
    head: string[];
    rows: string[][];
    caption?: string;
}

/** Таблица с горизонтальным скроллом на узких экранах. */
export const HowTable: React.FC<HowTableProps> = ({ head, rows, caption }) => (
    <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted/50">
                        {head.map((cell) => (
                            <th
                                key={cell}
                                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-t align-top"
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-4 py-2.5 text-foreground/90"
                                >
                                    {renderInline(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {caption && (
            <p className="border-t px-4 py-2 text-xs text-muted-foreground">
                {caption}
            </p>
        )}
    </div>
);
