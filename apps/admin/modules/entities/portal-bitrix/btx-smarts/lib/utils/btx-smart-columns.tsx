'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Column } from '@/modules/shared/ui/data-table';
import { SmartResponseDto } from '@workspace/nest-api';

type SmartColumnsActions = {
    onEdit?: (item: SmartResponseDto) => void;
    onDelete?: (item: SmartResponseDto) => void;
};

const formatDateCell = (value: unknown) => {
    if (!value) return '—';

    const date =
        typeof value === 'string' || typeof value === 'number'
            ? new Date(value)
            : new Date(String(value));

    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU');
};

export const createSmartColumns = ({
    onEdit,
    onDelete,
}: SmartColumnsActions): Column<SmartResponseDto>[] => [
    { id: 'id', header: 'ID', accessorKey: 'id', className: 'w-20' },
    { id: 'name', header: 'Name', accessorKey: 'name', className: 'w-48' },
    { id: 'title', header: 'Title', accessorKey: 'title', className: 'w-56' },
    { id: 'type', header: 'Type', accessorKey: 'type', className: 'w-32' },
    { id: 'group', header: 'Group', accessorKey: 'group', className: 'w-32' },
    { id: 'entityTypeId', header: 'Entity Type ID', accessorKey: 'entityTypeId', className: 'w-36' },
    { id: 'portal_id', header: 'Portal ID', accessorKey: 'portal_id', className: 'w-28' },
    {
        id: 'created_at',
        header: 'Created at',
        cell: (row) => formatDateCell(row.created_at),
        className: 'w-44',
    },
    {
        id: 'updated_at',
        header: 'Updated at',
        cell: (row) => formatDateCell(row.updated_at),
        className: 'w-44',
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
