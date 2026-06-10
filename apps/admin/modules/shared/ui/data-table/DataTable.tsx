'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { Checkbox } from '@workspace/ui/components/checkbox';


export interface Column<T> {
    id: string;
    header: string;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    className?: string;
    withChcekbox?: boolean;
    onCheckboxChange?: (id: string, checked: boolean) => void;

}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    emptyMessage = 'Нет данных',
    onRowClick,
    className,
    withChcekbox = false,
    onCheckboxChange,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (

            <div className={cn('rounded-md border overflow-x-auto h-full min-h-full', className)}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {withChcekbox && (
                                <TableHead className="w-3">
                                </TableHead>
                            )}
                            {columns.map((column) => (
                                <TableHead
                                    key={column.id}
                                    className={column.className}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={rowIndex}

                                className={cn(
                                    onRowClick && 'cursor-pointer hover:bg-accent',
                                )}
                            >
                                {withChcekbox && (
                                    <TableCell className="w-3">
                                        <Checkbox checked={row.isChecked} onCheckedChange={() => onCheckboxChange?.(row.id, row.isChecked)} />
                                    </TableCell>
                                )}
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        className={column.className}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRowClick?.(row);
                                        }}
                                    >
                                        {column.cell
                                            ? column.cell(row)
                                            : column.accessorKey
                                                ? String(row[column.accessorKey] ?? '')
                                                : ''}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

    );
}

