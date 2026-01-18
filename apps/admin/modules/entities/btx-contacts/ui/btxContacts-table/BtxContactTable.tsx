'use client';

import * as React from 'react';
import { BtxContactResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BtxContactTableProps {
    data: BtxContactResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BtxContactResponseDto) => void;
    onEdit?: (item: BtxContactResponseDto) => void;
    onDelete?: (item: BtxContactResponseDto) => void;
}

export function BtxContactTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BtxContactTableProps) {
    const columns: Column<BtxContactResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей BtxContactResponseDto
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
            emptyMessage="btxContactses не найдены"
            onRowClick={onRowClick}
        />
    );
}
