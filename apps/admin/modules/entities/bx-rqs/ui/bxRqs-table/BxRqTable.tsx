'use client';

import * as React from 'react';
import { BxRqResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BxRqTableProps {
    data: BxRqResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BxRqResponseDto) => void;
    onEdit?: (item: BxRqResponseDto) => void;
    onDelete?: (item: BxRqResponseDto) => void;
}

export function BxRqTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BxRqTableProps) {
    const columns: Column<BxRqResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей BxRqResponseDto
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
            emptyMessage="bxRqses не найдены"
            onRowClick={onRowClick}
        />
    );
}
