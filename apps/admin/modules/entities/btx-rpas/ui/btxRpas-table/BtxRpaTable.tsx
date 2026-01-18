'use client';

import * as React from 'react';
import { BtxRpaResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BtxRpaTableProps {
    data: BtxRpaResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BtxRpaResponseDto) => void;
    onEdit?: (item: BtxRpaResponseDto) => void;
    onDelete?: (item: BtxRpaResponseDto) => void;
}

export function BtxRpaTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BtxRpaTableProps) {
    const columns: Column<BtxRpaResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей BtxRpaResponseDto
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
            emptyMessage="btxRpases не найдены"
            onRowClick={onRowClick}
        />
    );
}
