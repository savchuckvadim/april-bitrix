'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { IGarantPackage } from '../../model';
import { Button } from '@workspace/ui/components/button';

interface PackageTableProps {
    data: IGarantPackage[];
    isLoading?: boolean;
    onRowClick?: (item: IGarantPackage) => void;
    onEdit?: (item: IGarantPackage) => void;
    onDelete?: (item: IGarantPackage) => void;
}

export function PackageTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: PackageTableProps) {
    const columns: Column<IGarantPackage>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'code',
            header: 'Code',
            accessorKey: 'code',
            className: 'w-20',
        },
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            className: 'w-40',
        },
        {
            id: 'fullName',
            header: 'Full Name',
            accessorKey: 'fullName',
            className: 'w-40',
        },
        {
            id: 'shortName',
            header: 'Short Name',
            accessorKey: 'shortName',
            className: 'w-30',
        },
        {
            id: 'type',
            header: 'Type',
            accessorKey: 'type',
            className: 'w-20',
        },
        {
            id: 'number',
            header: 'Number',
            accessorKey: 'number',
            className: 'w-20',
        },
        {
            id: 'weight',
            header: 'Weight',
            accessorKey: 'weight',
            className: 'w-20',
        },
        {
            id: 'withABS',
            header: 'With ABS',
            accessorKey: 'withABS',
            className: 'w-20',
            cell: (row) => (row.withABS ? 'Да' : 'Нет'),
        },
        {
            id: 'isChanging',
            header: 'Is Changing',
            accessorKey: 'isChanging',
            className: 'w-20',
            cell: (row) => (row.isChanging ? 'Да' : 'Нет'),
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
            emptyMessage="packages не найдены"
            onRowClick={onRowClick}
        />
    );
}
