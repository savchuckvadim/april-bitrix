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
import { Input } from '@workspace/ui/components/input';
import type { PlanIndicatorConfig, PlanIndicatorMeta } from '../model';
import { PLAN_PERIOD_LABELS } from '../lib/plans.data';

interface PlansTargetsGridProps {
    /** Включённые (в черновике) показатели. */
    indicators: { meta: PlanIndicatorMeta; config: PlanIndicatorConfig }[];
    employees: { userId: number; name: string }[];
    valueOf: (userId: number, code: string) => string;
    onChange: (userId: number, code: string, value: string) => void;
}

/** Сетка целей: сотрудники × включённые показатели (числовые инпуты). */
export const PlansTargetsGrid: React.FC<PlansTargetsGridProps> = ({
    indicators,
    employees,
    valueOf,
    onChange,
}) => {
    if (!indicators.length) {
        return (
            <p className="py-3 text-sm text-muted-foreground">
                Включите хотя бы один показатель, чтобы задать планы
            </p>
        );
    }
    return (
        <div className="max-h-[42vh] overflow-auto rounded-lg border border-border/60">
            <ShadcnTable>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[180px]">
                            Сотрудник
                        </TableHead>
                        {indicators.map(({ meta, config }) => (
                            <TableHead key={meta.code} className="min-w-[130px]">
                                {config.customName || meta.defaultName}
                                <span className="block text-[10px] font-normal text-muted-foreground">
                                    {PLAN_PERIOD_LABELS[config.periodType]}
                                </span>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map(employee => (
                        <TableRow key={employee.userId}>
                            <TableCell className="text-sm font-medium">
                                {employee.name}
                            </TableCell>
                            {indicators.map(({ meta }) => (
                                <TableCell key={meta.code}>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={valueOf(
                                            employee.userId,
                                            meta.code,
                                        )}
                                        onChange={event =>
                                            onChange(
                                                employee.userId,
                                                meta.code,
                                                event.target.value,
                                            )
                                        }
                                        placeholder="—"
                                        className="h-8 w-28 text-xs"
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </ShadcnTable>
        </div>
    );
};
