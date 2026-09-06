import React from 'react';
import { CalibrationTableCell } from './CalibrationTableCell';

interface CalibrationTableCardsProps {
    head: string[];
    rows: string[][];
}

/**
 * Мобильное представление таблицы: каждая строка — карточка «заголовок
 * колонки → значение». Горизонтальный скролл на телефоне читается плохо,
 * поэтому на узком экране страница остаётся одноколоночной.
 */
export const CalibrationTableCards: React.FC<CalibrationTableCardsProps> = ({
    head,
    rows,
}) => (
    <div className="calibration-table__cards space-y-3 md:hidden">
        {rows.map((row, rowIndex) => (
            <div
                key={rowIndex}
                className="rounded-lg border border-border bg-card px-4 py-3"
            >
                <dl className="space-y-2">
                    {row.map((cell, cellIndex) => (
                        <div key={cellIndex}>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                                {head[cellIndex]}
                            </dt>
                            <dd className="text-sm text-foreground/90 leading-relaxed">
                                <CalibrationTableCell value={cell} />
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        ))}
    </div>
);
