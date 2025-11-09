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
import { RTableProps } from '@/modules/shared';

interface MergedReportTotalTableProps {
    data: RTableProps['data'];
    selectedActions: string[];
}

export const MergedReportTotalTable: React.FC<MergedReportTotalTableProps> = ({
    data,
    selectedActions,
}) => {
    // Вычисляем общие суммы по каждому показателю
    const totalData = useMemo(() => {
        if (!data || data.length === 0) {
            return { actions: [] };
        }

        // Получаем все уникальные действия
        const allActions = data[0]?.actions.map(action => action.name) || [];
        const actionsToShow = selectedActions.length > 0
            ? allActions.filter(action => selectedActions.includes(action))
            : allActions;

        // Суммируем значения по каждому действию
        const totals = actionsToShow.map(actionName => {
            const total = data.reduce((sum, user) => {
                const action = user.actions.find(a => a.name === actionName);
                return sum + (action?.value || 0);
            }, 0);

            return {
                name: actionName,
                value: total,
            };
        });

        return {
            name: 'Итого',
            actions: totals,
        };
    }, [data, selectedActions]);

    if (!totalData.actions || totalData.actions.length === 0) {
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
                        {totalData.actions.map((action, i) => (
                            <Tooltip
                                key={`tooltip-total-head-${i}`}
                            >
                                <TooltipTrigger asChild>
                                    <TableHead
                                        key={`head-total-${i}`}
                                        className="text-right bg-popover text-primary font-bold"
                                    >
                                        {action.name}
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
                            {totalData.name}
                        </TableCell>
                        {totalData.actions.map((action, index) => (
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

