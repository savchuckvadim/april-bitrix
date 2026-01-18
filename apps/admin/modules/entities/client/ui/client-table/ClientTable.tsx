'use client';

import * as React from 'react';
import { ClientResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface ClientTableProps {
    data: ClientResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: ClientResponseDto) => void;
    onEdit?: (item: ClientResponseDto) => void;
    onDelete?: (item: ClientResponseDto) => void;
}

export function ClientTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: ClientTableProps) {
    const columns: Column<ClientResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'name',
            header: 'name',
            accessorKey: 'name',
            className: 'w-20',
        },
        {
            id: 'email',
            header: 'email',
            accessorKey: 'email',
            className: 'w-20',
        },
        {
            id: 'is_active',
            header: 'is_active',
            accessorKey: 'is_active',
            className: 'w-20',
        },
        {
            id: 'created_at',
            header: 'created_at',
            accessorKey: 'created_at',
            className: 'w-20',
        },
        {
            id: 'updated_at',
            header: 'updated_at',
            accessorKey: 'updated_at',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей ClientResponseDto
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
            emptyMessage="clients не найдены"
            onRowClick={onRowClick}
        />
    );
}
