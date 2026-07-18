'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/';
import { Button } from '@workspace/ui/components/button';
import { GetRegionResponseDto } from '@workspace/nest-admin-api';

interface RegionTableProps {
    data: GetRegionResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: GetRegionResponseDto) => void;
    onEdit?: (item: GetRegionResponseDto) => void;
    onDelete?: (item: GetRegionResponseDto) => void;
}

export function RegionTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: RegionTableProps) {
    const columns: Column<GetRegionResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'title',
            header: 'Title',
            accessorKey: 'title',
            className: 'w-20',
        },

        {
            id: 'code',
            header: 'Code',
            accessorKey: 'code',
            className: 'w-20',
        },
        {
            id: 'abs',
            header: 'Abs',
            accessorKey: 'abs',
            className: 'w-20',
        },
        {
            id: 'tax',
            header: 'Tax',
            accessorKey: 'tax',
            className: 'w-20',
        },
        {
            id: 'tax_abs',
            header: 'Tax Abs',
            accessorKey: 'tax_abs',
            className: 'w-20',
        },

        // TODO: Добавьте колонки на основе полей MeasureResponseDto
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
            emptyMessage="measureses не найдены"
            onRowClick={onRowClick}
        />
    );
}
