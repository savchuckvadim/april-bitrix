'use client';

import * as React from 'react';
import { AppSecretDto } from '@workspace/nest-admin-api';
import { DataTable, Column } from '@/modules/shared';
import { Button } from '@workspace/ui/components/button';
import { formatDateTime } from '../../../shared';

interface SecretsTableProps {
    data: AppSecretDto[];
    isLoading?: boolean;
    onEdit?: (item: AppSecretDto) => void;
    onDelete?: (item: AppSecretDto) => void;
}

/** Таблица OAuth-кред приложений (client_secret маскирован). */
export function SecretsTable({ data, isLoading, onEdit, onDelete }: SecretsTableProps) {
    const columns: Column<AppSecretDto>[] = [
        {
            id: 'code',
            header: 'Код приложения',
            cell: (row) => <span className="font-mono text-xs font-medium">{row.code}</span>,
        },
        {
            id: 'clientId',
            header: 'client_id',
            cell: (row) => <span className="font-mono text-xs">{row.clientId}</span>,
        },
        {
            id: 'clientSecretMasked',
            header: 'client_secret',
            cell: (row) => (
                <span className="font-mono text-xs">{row.clientSecretMasked}</span>
            ),
        },
        {
            id: 'group',
            header: 'Группа',
            cell: (row) => row.group || '—',
            className: 'w-28',
        },
        {
            id: 'type',
            header: 'Тип',
            cell: (row) => row.type || '—',
            className: 'w-28',
        },
        {
            id: 'updatedAt',
            header: 'Обновлено',
            cell: (row) => formatDateTime(row.updatedAt),
            className: 'w-40',
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
            emptyMessage="Креды приложений не найдены"
        />
    );
}
