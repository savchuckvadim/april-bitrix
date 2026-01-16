'use client';

import * as React from 'react';
import { DataTable, Column } from '../data-table';
import { Button } from '@workspace/ui/components/button';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

/**
 * Конфигурация колонок для EntityTable
 */
export interface EntityColumnConfig<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
    className?: string;
}

/**
 * Пропсы для EntityTable
 */
export interface EntityTableProps<T extends Record<string, any>> {
    data: T[];
    columns: EntityColumnConfig<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    className?: string;
    // ID поле для определения уникальности строки
    idField?: keyof T | 'id';
}

/**
 * Универсальная таблица для отображения сущностей
 * Принимает конфигурацию колонок и автоматически рендерит таблицу
 */
export function EntityTable<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    emptyMessage = 'Нет данных',
    onRowClick,
    onEdit,
    onDelete,
    onView,
    className,
    idField = 'id',
}: EntityTableProps<T>) {
    const tableColumns: Column<T>[] = [
        ...columns.map((col) => ({
            id: String(col.key),
            header: col.label,
            accessorKey: col.key as keyof T,
            cell: col.render
                ? (row: T) => col.render!(row[col.key], row)
                : undefined,
            className: col.className,
        })),
        {
            id: 'actions',
            header: 'Действия',
            cell: (row: T) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onView && (
                            <DropdownMenuItem onClick={() => onView(row)}>
                                Просмотр
                            </DropdownMenuItem>
                        )}
                        {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(row)}>
                                Редактировать
                            </DropdownMenuItem>
                        )}
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(row)}
                                className="text-destructive"
                            >
                                Удалить
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: 'w-20',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={tableColumns}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            onRowClick={onRowClick}
            className={className}
        />
    );
}

