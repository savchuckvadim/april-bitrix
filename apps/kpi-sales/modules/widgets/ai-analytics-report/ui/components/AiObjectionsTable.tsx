'use client';

import { Fragment } from 'react';
import { Card } from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    AiMetricValue,
    aiObjectionCategoryLabel,
    type AiObjections,
} from '@/modules/entities/ai-analytics';
import { AiManagerName } from './AiManagerName';

interface AiObjectionsTableProps {
    objections: AiObjections;
}

/**
 * Срез возражений: строка на (сотрудник × категория): n, звонков,
 * handled % (Уилсон 90 %), исходы continued / converted / disengaged.
 * Итоги по домену — отдельной строкой снизу.
 */
export const AiObjectionsTable = ({ objections }: AiObjectionsTableProps) => {
    if (!objections.byManager.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                За период возражений в разборах периметра нет.
            </p>
        );
    }

    return (
        <Card className="overflow-x-auto p-2 bg-popover text-primary">
            <Table className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-44">Сотрудник</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead className="text-right">n</TableHead>
                        <TableHead className="text-right">Звонков</TableHead>
                        <TableHead>Отработано</TableHead>
                        <TableHead className="text-right">Продолжили</TableHead>
                        <TableHead className="text-right">
                            Согласились
                        </TableHead>
                        <TableHead className="text-right">Ушли</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {objections.byManager.map(manager => (
                        <Fragment key={manager.managerId}>
                            {manager.byCategory.map((category, index) => (
                                <TableRow
                                    key={`${manager.managerId}-${category.category}`}
                                >
                                    <TableCell>
                                        {index === 0 && (
                                            <>
                                                <AiManagerName
                                                    managerId={
                                                        manager.managerId
                                                    }
                                                />
                                                <span className="ml-2 text-[0.6875rem] text-muted-foreground">
                                                    всего {manager.n}
                                                </span>
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {aiObjectionCategoryLabel(
                                            category.category,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {category.n}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {category.calls}
                                    </TableCell>
                                    <TableCell>
                                        <AiMetricValue
                                            metric={category.handledRatePct}
                                            kind="pct"
                                            withDetails
                                        />
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {category.outcomes.continued}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {category.outcomes.converted}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {category.outcomes.disengaged}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Fragment>
                    ))}
                    {objections.totals.map(category => (
                        <TableRow
                            key={`total-${category.category}`}
                            className="bg-muted/40 hover:bg-muted/40"
                        >
                            <TableCell className="text-xs font-semibold text-muted-foreground">
                                Итого по домену
                            </TableCell>
                            <TableCell>
                                {aiObjectionCategoryLabel(category.category)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {category.n}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {category.calls}
                            </TableCell>
                            <TableCell>
                                <AiMetricValue
                                    metric={category.handledRatePct}
                                    kind="pct"
                                />
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {category.outcomes.continued}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {category.outcomes.converted}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {category.outcomes.disengaged}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};
