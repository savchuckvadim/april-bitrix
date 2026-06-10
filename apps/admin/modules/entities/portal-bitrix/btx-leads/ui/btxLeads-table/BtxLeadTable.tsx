'use client';

import * as React from 'react';
import { BtxLeadResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BtxLeadTableProps {
    data: BtxLeadResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BtxLeadResponseDto) => void;
    onEdit?: (item: BtxLeadResponseDto) => void;
    onDelete?: (item: BtxLeadResponseDto) => void;
}

export function BtxLeadTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BtxLeadTableProps) {
    const columns: Column<BtxLeadResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей BtxLeadResponseDto
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
            emptyMessage="btxLeadses не найдены"
            onRowClick={onRowClick}
        />
    );
}
