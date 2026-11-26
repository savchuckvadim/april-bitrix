'use client'
import React, { useMemo } from 'react';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { RTABLE_HEADER_TEXT_CLASS } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { RTableProps } from '@/modules/shared';
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import { getMergedTotalColumns } from '../lib/merged-labels.util';

interface MergedReportTotalTableProps {
    /** Строки объединённой таблицы с ИСХОДНЫМИ названиями колонок. */
    data: RTableProps['data'];
    /** Выбор колонок по исходным названиям; пусто — все. */
    selectedActions: string[];
    /** Выводимые названия колонок. */
    labelOf: IndicatorLabeler;
}

export const MergedReportTotalTable: React.FC<MergedReportTotalTableProps> = ({
    data,
    selectedActions,
    labelOf,
}) => {
    // Общие суммы по каждому показателю (название — выводимое)
    const totals = useMemo(
        () => getMergedTotalColumns(data ?? [], selectedActions, labelOf),
        [data, selectedActions, labelOf],
    );

    if (totals.length === 0) {
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
                        {totals.map((action, i) => (
                            <Tooltip
                                key={`tooltip-total-head-${i}`}
                            >
                                <TooltipTrigger asChild>
                                    <TableHead
                                        key={`head-total-${i}`}
                                        className="text-right bg-popover text-primary font-bold"
                                    >
                                        <span className={cn('ml-auto', RTABLE_HEADER_TEXT_CLASS)}>
                                            {action.name}
                                        </span>
                                    </TableHead>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                    {action.name}
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
                        {totals.map((action, index) => (
                            <TableCell
                                key={`cell-total-${index}`}
                                className="text-right font-bold text-lg"
                            >
                                {action.value}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </ShadcnTable>
        </Card>
    );
};
