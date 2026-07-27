'use client';

import React from 'react';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import type {
    EnabledPlanIndicator,
    PlanAchievementCell,
    PlanAchievementRow,
} from '../lib/plan-achievement.util';
import { PlanProgressCell } from './PlanProgressCell';

interface PlansAchievementTableProps {
    indicators: EnabledPlanIndicator[];
    rows: PlanAchievementRow[];
    /** Итоговая строка (Σ секции/команды); не передана — без итога. */
    totals?: PlanAchievementCell[];
    expected: number;
}

/** Таблица достижения планов: сотрудники × включённые показатели. */
export const PlansAchievementTable: React.FC<PlansAchievementTableProps> = ({
    indicators,
    rows,
    totals,
    expected,
}) => {
    if (!rows.length) {
        return (
            <p className="py-4 text-sm text-muted-foreground">
                Нет данных за период
            </p>
        );
    }

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <ShadcnTable className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[190px]">Менеджер</TableHead>
                        {indicators.map(indicator => (
                            <TableHead key={indicator.code}>
                                {indicator.displayName}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.userId}>
                            <TableCell className="font-medium">
                                {row.userName}
                            </TableCell>
                            {row.cells.map((cell, index) => (
                                <TableCell key={cell.code}>
                                    <PlanProgressCell
                                        cell={cell}
                                        unit={indicators[index]!.unit}
                                        expected={expected}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {totals && (
                        <TableRow className="border-t-2">
                            <TableCell className="font-semibold">
                                Итого
                            </TableCell>
                            {totals.map((cell, index) => (
                                <TableCell key={cell.code}>
                                    <PlanProgressCell
                                        cell={cell}
                                        unit={indicators[index]!.unit}
                                        expected={expected}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    )}
                </TableBody>
            </ShadcnTable>
        </Card>
    );
};
