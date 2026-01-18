'use client';

import * as React from 'react';
import { TimezoneResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface TimezoneTableProps {
    data: TimezoneResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: TimezoneResponseDto) => void;
    onEdit?: (item: TimezoneResponseDto) => void;
    onDelete?: (item: TimezoneResponseDto) => void;
}

export function TimezoneTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: TimezoneTableProps) {
    const columns: Column<TimezoneResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей TimezoneResponseDto
        {
            id: 'actions',
            header: 'Действия',
            cell: (row) => (
                <div className="flex gap-2">
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                            }}
                        >
                            Изменить
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            ),
            className: 'w-48',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="timezoneses не найдены"
            onRowClick={onRowClick}
        />
    );
}
