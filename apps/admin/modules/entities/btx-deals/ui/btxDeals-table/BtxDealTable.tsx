'use client';

import * as React from 'react';
import { BtxDealResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BtxDealTableProps {
    data: BtxDealResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BtxDealResponseDto) => void;
    onEdit?: (item: BtxDealResponseDto) => void;
    onDelete?: (item: BtxDealResponseDto) => void;
}

export function BtxDealTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BtxDealTableProps) {
    const columns: Column<BtxDealResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей BtxDealResponseDto
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
            emptyMessage="btxDealses не найдены"
            onRowClick={onRowClick}
        />
    );
}
