'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { InfoblockListItem } from '../../model';
import { Button } from '@workspace/ui/components/button';

interface InfoblockTableProps {
    data: InfoblockListItem[];
    isLoading?: boolean;
    onRowClick?: (item: InfoblockListItem) => void;
    onEdit?: (item: InfoblockListItem) => void;
    onDelete?: (item: InfoblockListItem) => void;
}

export function InfoblockTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: InfoblockTableProps) {
    const columns: Column<InfoblockListItem>[] = [
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
            className: 'w-20',
        },
        {
            id: 'inGroupId',
            header: 'inGroupId',
            accessorKey: 'inGroupId',
            className: 'w-20',
        },
        {
            id: 'groupId',
            header: 'Group ID',
            accessorKey: 'group_id',
            className: 'w-20',
        },
        {
            id: 'description',
            header: 'Description',
            accessorKey: 'description',
            className: 'w-20',
        },
        {
            id: 'descriptionForSale',
            header: 'Description For Sale',
            accessorKey: 'descriptionForSale',
            className: 'w-20',
        },
        {
            id: 'shortDescription',
            header: 'Short Description',
            accessorKey: 'shortDescription',
            className: 'w-20',
        },
        {
            id: 'updatedAt',
            header: 'Updated At',
            accessorKey: 'updated_at',
            className: 'w-20',
        },

        // TODO: Добавьте колонки на основе полей InfoblockListItem

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
            emptyMessage="infoblocks не найдены"
            onRowClick={onRowClick}
        />
    );
}
