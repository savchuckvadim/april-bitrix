'use client';

import * as React from 'react';
import { SmartResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface SmartTableProps {
    data: SmartResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: SmartResponseDto) => void;
    onEdit?: (item: SmartResponseDto) => void;
    onDelete?: (item: SmartResponseDto) => void;
}

export function SmartTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: SmartTableProps) {
    const columns: Column<SmartResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей SmartResponseDto
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
            emptyMessage="smartses не найдены"
            onRowClick={onRowClick}
        />
    );
}
