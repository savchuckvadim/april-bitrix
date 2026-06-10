'use client';

import * as React from 'react';
import { GetPortalRegionResponseDto } from '../../model';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface PortalRegionsTableProps {
    data: GetPortalRegionResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: GetPortalRegionResponseDto) => void;
    onEdit?: (item: GetPortalRegionResponseDto) => void;

    onCheckboxChange?: (id: string, checked: boolean) => void;
}

export function PortalRegionsTable({
    data,
    isLoading,
    onRowClick,
    onCheckboxChange,
    onEdit,

}: PortalRegionsTableProps) {
    const columns: Column<GetPortalRegionResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'title',
            header: 'Region Name',
            accessorKey: 'title',
            className: 'w-20',
        },
        {
            id: 'isChecked',
            header: 'isChecked',
            accessorKey: 'isChecked',
            className: 'w-20',
        },
        {
            id: 'code',
            header: 'code',
            accessorKey: 'code',
            className: 'w-20',
        },
        {
            id: 'abs',
            header: 'abs',
            accessorKey: 'abs',
            className: 'w-20',
        },
        {
            id: 'tax',
            header: 'tax',
            accessorKey: 'tax',
            className: 'w-20',
        },
        {
            id: 'tax_abs',
            header: 'tax_abs',
            accessorKey: 'tax_abs',
            className: 'w-20',
        },

        {
            id: 'infoblock',
            header: 'infoblock',
            accessorKey: 'infoblock',
            className: 'w-20',
        },

        // TODO: Добавьте колонки на основе полей PortalMeasureResponseDto
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
                    {/* {onDelete && (
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
                    )} */}
                </div>
            ),
            className: 'w-48',
        },
    ];

    return (
        <DataTable
            withChcekbox={true}
            onCheckboxChange={onCheckboxChange}
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="portalMeasureses не найдены"
            onRowClick={onRowClick}
        />
    );
}
