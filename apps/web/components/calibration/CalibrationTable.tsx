import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { CalibrationTableCards } from './CalibrationTableCards';
import { CalibrationTableCell } from './CalibrationTableCell';

interface CalibrationTableProps {
    head: string[];
    rows: string[][];
}

/**
 * Таблица раздела: на десктопе обычная таблица, на телефоне — карточки
 * (см. `CalibrationTableCards`).
 */
export const CalibrationTable: React.FC<CalibrationTableProps> = ({
    head,
    rows,
}) => (
    <div className="calibration-table">
        <CalibrationTableCards head={head} rows={rows} />

        <div className="calibration-table__grid hidden overflow-hidden rounded-lg border border-border md:block">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/60">
                        {head.map((title, index) => (
                            <TableHead
                                key={index}
                                className="align-top text-foreground font-semibold"
                            >
                                {title}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <TableCell
                                    key={cellIndex}
                                    className="align-top whitespace-normal text-foreground/90 leading-relaxed"
                                >
                                    <CalibrationTableCell value={cell} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
);
