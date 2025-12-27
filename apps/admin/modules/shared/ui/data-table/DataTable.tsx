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
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    emptyMessage = 'Нет данных',
    onRowClick,
    className,
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
        <div className={cn('rounded-md border', className)}>
            <Table>
                <TableHeader>
                    <TableRow>
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
                            onClick={() => onRowClick?.(row)}
                            className={cn(
                                onRowClick && 'cursor-pointer hover:bg-accent',
                            )}
                        >
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    className={column.className}
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

