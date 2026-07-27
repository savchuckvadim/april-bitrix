'use client';
import { FC } from 'react';
import {
    Table as ShadcnTable,
    TableBody,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import { RTableHeaderRow } from './RTableHeaderRow';
import { RTableNameCell } from './RTableNameCell';
import { RTableValueCell } from './RTableValueCell';
import { RTableProps } from './rtable.types';

/**
 * Универсальная таблица отчёта «сотрудники × показатели»: имя-ссылка на
 * user-report, значения с подстроками аннотаций (конверсии «↳ %» и планы
 * «⌖ план · %» — независимые каналы). Единственная реализация в монорепе
 * (локальная копия kpi-sales удалена, shared реэкспортирует отсюда).
 */
export const RTable: FC<RTableProps> = ({
    code,
    data,
    firstCellName,
    withLink,
    onClick,
    annotations,
    planAnnotations,
}) => (
    <Card className="my-4 p-4 bg-popover text-primary">
        <ShadcnTable className="bg-popover text-primary">
            <TableHeader>
                <RTableHeaderRow
                    code={code}
                    firstCellName={firstCellName}
                    templateRow={data?.[0]}
                />
            </TableHeader>
            <TableBody>
                {data.map((row, rowIndex) => (
                    <TableRow key={`report-${code}-${row.name}-${rowIndex}`}>
                        <RTableNameCell
                            row={row}
                            withLink={withLink}
                            onClick={onClick}
                        />
                        {row.actions.map((action, index) => {
                            const cellKey =
                                row.id !== undefined && action.code
                                    ? `${row.id}:${action.code}`
                                    : null;
                            return (
                                <RTableValueCell
                                    key={`cell-${code}-action-${index}`}
                                    value={action.value}
                                    annotation={
                                        cellKey
                                            ? annotations?.get(cellKey)
                                            : undefined
                                    }
                                    planAnnotation={
                                        cellKey
                                            ? planAnnotations?.get(cellKey)
                                            : undefined
                                    }
                                />
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </ShadcnTable>
    </Card>
);
