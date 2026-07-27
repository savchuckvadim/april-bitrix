'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    financeEmployeeName,
    formatMoney,
    type FinanceClosedEmployee,
} from '@/modules/entities/finance';
import { FinanceDealsSubTable } from './FinanceDealsSubTable';

interface FinanceEmployeeTableProps {
    employees: FinanceClosedEmployee[];
}

/** Таблица по сотрудникам с раскрытием строки в список сделок. */
export const FinanceEmployeeTable: React.FC<FinanceEmployeeTableProps> = ({
    employees,
}) => {
    const departmentItems = useAppSelector(state => state.department.items);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    if (!employees.length) {
        return (
            <p className="py-4 text-sm text-muted-foreground">
                За период нет закрытых сделок
            </p>
        );
    }

    const toggle = (id: number) =>
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const sorted = [...employees].sort(
        (a, b) => b.monthlyAmount - a.monthlyAmount,
    );

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <ShadcnTable className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[240px]">Менеджер</TableHead>
                        <TableHead className="text-right">Сделок</TableHead>
                        <TableHead className="text-right">Аванс</TableHead>
                        <TableHead className="text-right">Месячная</TableHead>
                        <TableHead className="text-right">Мес.</TableHead>
                        <TableHead className="text-right">Ожидаемая</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.map(employee => {
                        const isOpen = expanded.has(employee.assignedId);
                        return (
                            <React.Fragment key={employee.assignedId}>
                                <TableRow
                                    className="cursor-pointer"
                                    onClick={() => toggle(employee.assignedId)}
                                >
                                    <TableCell className="font-medium">
                                        <span className="inline-flex items-center gap-1">
                                            {isOpen ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                            {financeEmployeeName(
                                                departmentItems,
                                                employee.assignedId,
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {employee.dealsCount}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatMoney(employee.advanceAmount)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatMoney(employee.monthlyAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {employee.paidMonths}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatMoney(
                                            employee.expectedContractAmount,
                                        )}
                                    </TableCell>
                                </TableRow>
                                {isOpen && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-2">
                                            <FinanceDealsSubTable
                                                deals={employee.deals}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </ShadcnTable>
        </Card>
    );
};
