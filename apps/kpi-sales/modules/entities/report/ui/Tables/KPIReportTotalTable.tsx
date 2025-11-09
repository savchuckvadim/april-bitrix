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
import { ReportData } from '../../model/types/report/report-type';

interface KPIReportTotalTableProps {
    report: ReportData[];
}

export const KPIReportTotalTable: React.FC<KPIReportTotalTableProps> = ({
    report,
}) => {
    // Вычисляем общие суммы по каждому показателю
    const totalData = useMemo(() => {
        if (!report || report.length === 0 || !report[0]?.kpi) {
            return { actions: [] };
        }

        // Получаем все уникальные действия из первого отчета
        const allActions = report[0].kpi.map(kpi => ({
            name: kpi.action.name || 'Unknown',
            innerCode: kpi.action.innerCode,
        }));

        // Суммируем значения по каждому действию
        const totals = allActions.map(action => {
            const total = report.reduce((sum, userReport) => {
                const kpi = userReport.kpi.find(
                    k => k.action.innerCode === action.innerCode
                );
                return sum + (kpi?.count || 0);
            }, 0);

            return {
                name: action.name,
                value: total,
            };
        });

        return {
            name: 'Итого',
            actions: totals,
        };
    }, [report]);

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

