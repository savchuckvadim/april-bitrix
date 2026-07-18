'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { GetSupplyResponseDto } from '@workspace/nest-admin-api';

interface SuppliesTableProps {
    data: GetSupplyResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: GetSupplyResponseDto) => void;
    onEdit?: (item: GetSupplyResponseDto) => void;
    onDelete?: (item: GetSupplyResponseDto) => void;
}

export function SuppliesTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: SuppliesTableProps) {
    const columns: Column<GetSupplyResponseDto>[] = [
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
            id: 'fullName',
            header: 'Full Name',
            accessorKey: 'fullName',
            className: 'w-20',
        },
        {
            id: 'shortName',
            header: 'Short Name',
            accessorKey: 'shortName',
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
            id: 'usersQuantity',
            header: 'Users Quantity',
            accessorKey: 'usersQuantity',
            className: 'w-20',
        },
        {
            id: 'coefficient',
            header: 'Coefficient',
            accessorKey: 'coefficient',
            className: 'w-20',
        },
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
            emptyMessage="supplies не найдены"
            onRowClick={onRowClick}
        />
    );
}
