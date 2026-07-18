'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { GetComplectResponseDto } from '@workspace/nest-admin-api';

interface PdfTemplateTableProps {
    data: GetComplectResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: GetComplectResponseDto) => void;
    onEdit?: (item: GetComplectResponseDto) => void;
    onDelete?: (item: GetComplectResponseDto) => void;
}

export function PdfTemplateTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: PdfTemplateTableProps) {
    const columns: Column<GetComplectResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            className: 'w-20',
        },
        {
            id: 'weight',
            header: 'Weight',
            accessorKey: 'weight',
            className: 'w-20',
        },
        {
            id: 'abs',
            header: 'Abs',
            accessorKey: 'abs',
            className: 'w-20',
        },
        {
            id: 'number',
            header: 'Number',
            accessorKey: 'number',
            className: 'w-20',
        },
        {
            id: 'code',
            header: 'Code',
            accessorKey: 'code',
            className: 'w-20',
        },
        {
            id: 'type',
            header: 'Type',
            accessorKey: 'type',
            className: 'w-20',
        },
        {
            id: 'isChanging',
            header: 'isChanging',
            accessorKey: 'isChanging',
            className: 'w-20',
        },
        {
            id: 'color',
            header: 'Color',
            accessorKey: 'color',
            className: 'w-20',
        },
        {
            id: 'withDefault',
            header: 'With Default',
            accessorKey: 'withDefault',
            className: 'w-20',
        },
        {
            id: 'withLt',
            header: 'With LT',
            accessorKey: 'withLt',
            className: 'w-20',
        },
        {
            id: 'productType',
            header: 'Product Type',
            accessorKey: 'productType',
            className: 'w-20',
        },
        {
            id: 'withConsalting',
            header: 'With Consalting',
            accessorKey: 'withConsalting',
            className: 'w-20',
        },

        // TODO: Добавьте колонки на основе полей GetComplectResponseDto
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
            emptyMessage="complects не найдены"
            onRowClick={onRowClick}
        />
    );
}
