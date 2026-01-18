'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BitrixAppTableProps {
    data: any[];
    isLoading?: boolean;
    onRowClick?: (app: any) => void;
    onEdit?: (app: any) => void;
    onDelete?: (app: any) => void;
}

export function BitrixAppTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BitrixAppTableProps) {
    const columns: Column<any>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'code',
            header: 'Код',
            accessorKey: 'code',
        },
        {
            id: 'group',
            header: 'Группа',
            cell: (row) => (
                <Badge variant="outline">{row.group || '—'}</Badge>
            ),
        },
        {
            id: 'type',
            header: 'Тип',
            cell: (row) => (
                <Badge variant="secondary">{row.type || '—'}</Badge>
            ),
        },
        {
            id: 'status',
            header: 'Статус',
            cell: (row) => (
                <Badge
                    variant={
                        row.status === 'installed'
                            ? 'default'
                            : row.status === 'error'
                              ? 'destructive'
                              : 'secondary'
                    }
                >
                    {row.status || '—'}
                </Badge>
            ),
        },
        {
            id: 'portal_id',
            header: 'Portal ID',
            accessorKey: 'portal_id',
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
            emptyMessage="Приложения не найдены"
            onRowClick={onRowClick}
        />
    );
}

