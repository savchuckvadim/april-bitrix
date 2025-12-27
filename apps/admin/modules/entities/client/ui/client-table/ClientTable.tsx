'use client';

import * as React from 'react';
import { ClientResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ClientTableProps {
    data: ClientResponseDto[];
    isLoading?: boolean;
    onRowClick?: (client: ClientResponseDto) => void;
    onEdit?: (client: ClientResponseDto) => void;
    onDelete?: (client: ClientResponseDto) => void;
}

export function ClientTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: ClientTableProps) {
    const columns: Column<ClientResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'name',
            header: 'Имя',
            accessorKey: 'name',
        },
        {
            id: 'email',
            header: 'Email',
            cell: (row) => (
                <span className="text-muted-foreground">
                    {row.email || '—'}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Статус',
            cell: (row) => (
                <Badge
                    variant={
                        row.status === 'active'
                            ? 'default'
                            : row.status === 'inactive'
                              ? 'secondary'
                              : 'outline'
                    }
                >
                    {row.status || '—'}
                </Badge>
            ),
        },
        {
            id: 'is_active',
            header: 'Активен',
            cell: (row) => (
                <Badge variant={row.is_active ? 'default' : 'secondary'}>
                    {row.is_active ? 'Да' : 'Нет'}
                </Badge>
            ),
        },
        {
            id: 'created_at',
            header: 'Создан',
            cell: (row) =>
                row.created_at ? (
                    <span className="text-sm text-muted-foreground">
                        {format(
                            new Date(row.created_at),
                            'dd.MM.yyyy HH:mm',
                            { locale: ru },
                        )}
                    </span>
                ) : (
                    '—'
                ),
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
            emptyMessage="Клиенты не найдены"
            onRowClick={onRowClick}
        />
    );
}

