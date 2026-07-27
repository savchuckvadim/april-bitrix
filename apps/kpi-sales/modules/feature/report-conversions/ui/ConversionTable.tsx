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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
    ConversionResult,
    ConversionStep,
    formatPercent,
} from '../lib/conversion-calc.util';
import {
    conversionTextClass,
    getConversionIntent,
} from '../lib/conversion-intent.util';
import { MIN_DENOMINATOR_FOR_CHAMPION } from '../lib/conversion-catalog';

interface ConversionTableProps {
    result: ConversionResult;
    /** Ссылки на user report из имён менеджеров. */
    withLink?: boolean;
    /** Бейдж-кубок лучшему по шагу (при достаточной базе). */
    withChampions?: boolean;
}

const championUserIds = (result: ConversionResult): Set<string> => {
    const champions = new Set<string>();
    result.stepDefs.forEach((_def, i) => {
        let best: { userId: number; percent: number } | null = null;
        result.rows.forEach(row => {
            const step = row.steps[i];
            if (
                !step ||
                step.percent === null ||
                step.denominator < MIN_DENOMINATOR_FOR_CHAMPION
            )
                return;
            if (!best || step.percent > best.percent) {
                best = { userId: row.userId, percent: step.percent };
            }
        });
        if (best) champions.add(`${(best as { userId: number }).userId}:${i}`);
    });
    return champions;
};

const stepTooltip = (step: ConversionStep | undefined): string =>
    step ? `${step.numerator} из ${step.denominator}` : '';

/**
 * Таблица конверсий: строки — менеджеры, колонки — шаги «A → B»,
 * футер — «Итого» (по суммам) и «Медиана». Раскраска — vs медиана команды.
 */
export const ConversionTable: React.FC<ConversionTableProps> = ({
    result,
    withLink = true,
    withChampions = true,
}) => {
    if (!result.stepDefs.length || !result.rows.length) return null;
    const champions = withChampions
        ? championUserIds(result)
        : new Set<string>();

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <ShadcnTable className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[190px] bg-popover text-primary">
                            Менеджер
                        </TableHead>
                        {result.stepDefs.map((def, i) => (
                            <Tooltip key={`conv-head-${i}`}>
                                <TooltipTrigger asChild>
                                    <TableHead className="text-right bg-popover text-primary">
                                        {def.fromName} → {def.toName}
                                    </TableHead>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                    {def.toName} / {def.fromName}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.rows.map(row => (
                        <TableRow key={`conv-row-${row.userId}`}>
                            <TableCell className="font-medium">
                                {withLink ? (
                                    <Link
                                        href={`/report/user?userId=${row.userId}`}
                                        className="text-primary hover:underline"
                                    >
                                        {row.name}
                                    </Link>
                                ) : (
                                    row.name
                                )}
                            </TableCell>
                            {row.steps.map((step, i) => {
                                const intent = getConversionIntent(
                                    step,
                                    result.median[i],
                                );
                                return (
                                    <TableCell
                                        key={`conv-cell-${row.userId}-${i}`}
                                        className="text-right"
                                    >
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 font-medium',
                                                        conversionTextClass(
                                                            intent,
                                                        ),
                                                    )}
                                                >
                                                    {champions.has(
                                                        `${row.userId}:${i}`,
                                                    ) && (
                                                        <Trophy className="h-3 w-3 text-warning" />
                                                    )}
                                                    {formatPercent(
                                                        step.percent,
                                                    )}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">
                                                {stepTooltip(step)}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
                <TableBody>
                    <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Итого</TableCell>
                        {result.total.map((step, i) => (
                            <TableCell
                                key={`conv-total-${i}`}
                                className="text-right font-semibold"
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            {formatPercent(step.percent)}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        {stepTooltip(step)}
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-muted-foreground">
                            Медиана
                        </TableCell>
                        {result.median.map((step, i) => (
                            <TableCell
                                key={`conv-median-${i}`}
                                className="text-right text-muted-foreground"
                            >
                                {formatPercent(step.percent)}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </ShadcnTable>
        </Card>
    );
};
