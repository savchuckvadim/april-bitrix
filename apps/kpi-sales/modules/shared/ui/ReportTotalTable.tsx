'use client';

import type { FC } from 'react';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { RTABLE_HEADER_TEXT_CLASS, type RTableAction } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';

interface ReportTotalTableProps {
    /**
     * Колонки итога: выводимое название и сумма; у колонки плана — класс
     * шапки и ячейки, подсказка шапки и текст вместо числа («—» или пусто).
     */
    columns: readonly RTableAction[];
}

/**
 * Итоговая таблица показателей: одна строка «Итого» с суммами по
 * колонкам. Длинное название в шапке обрезается «…», полное — в подсказке
 * (с пояснением колонки, если оно есть). Нет колонок — ничего.
 */
export const ReportTotalTable: FC<ReportTotalTableProps> = ({ columns }) => {
    if (columns.length === 0) {
        return null;
    }

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <ShadcnTable className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[190px] bg-popover text-primary font-bold">
                            Показатель
                        </TableHead>
                        {columns.map((column, i) => (
                            <Tooltip key={`tooltip-total-head-${i}`}>
                                <TooltipTrigger asChild>
                                    <TableHead
                                        className={cn(
                                            'text-right bg-popover text-primary font-bold',
                                            column.headerClassName,
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'ml-auto',
                                                RTABLE_HEADER_TEXT_CLASS,
                                            )}
                                        >
                                            {column.name}
                                        </span>
                                    </TableHead>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[320px] whitespace-pre-line text-xs">
                                    <div>{column.name}</div>
                                    {column.headerHint && (
                                        <div className="opacity-80">
                                            {column.headerHint}
                                        </div>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-muted/50">
                        <TableCell className="font-bold text-lg">
                            Итого
                        </TableCell>
                        {columns.map((column, index) => (
                            <TableCell
                                key={`cell-total-${index}`}
                                className={cn(
                                    'text-right font-bold text-lg',
                                    column.cellClassName,
                                )}
                            >
                                {column.display ?? column.value}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </ShadcnTable>
        </Card>
    );
};
