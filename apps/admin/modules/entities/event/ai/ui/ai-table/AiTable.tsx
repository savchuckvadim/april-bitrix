'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { AiEntity } from '../../model';

interface AiTableProps {
    data: AiEntity[];
    isLoading?: boolean;
    onRowClick?: (item: AiEntity) => void;
}

export function AiTable({
    data,
    isLoading,
    onRowClick,
}: AiTableProps) {
    const columns: Column<AiEntity>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-24',
        },
        {
            id: 'domain',
            header: 'Домен',
            accessorKey: 'domain',
            className: 'w-32',
        },
        {
            id: 'user_name',
            header: 'Пользователь',
            accessorKey: 'user_name',
            className: 'w-32',
        },
        {
            id: 'provider',
            header: 'Провайдер',
            accessorKey: 'provider',
            className: 'w-24',
        },
        {
            id: 'status',
            header: 'Статус',
            accessorKey: 'status',
            className: 'w-24',
        },
        {
            id: 'entity_type',
            header: 'Тип сущности',
            accessorKey: 'entity_type',
            className: 'w-32',
        },
        {
            id: 'entity_name',
            header: 'Название сущности',
            accessorKey: 'entity_name',
            className: 'w-40',
        },
        {
            id: 'app',
            header: 'Приложение',
            accessorKey: 'app',
            className: 'w-32',
        },
        {
            id: 'department',
            header: 'Отдел',
            accessorKey: 'department',
            className: 'w-32',
        },
        {
            id: 'type',
            header: 'Тип',
            accessorKey: 'type',
            className: 'w-24',
        },
        {
            id: 'model',
            header: 'Модель',
            accessorKey: 'model',
            className: 'w-32',
        },
        {
            id: 'result',
            header: 'Результат',
            cell: (row) => (
                <div className="max-w-md truncate" title={row.result}>
                    {row.result || '—'}
                </div>
            ),
            className: 'w-64',
        },
        {
            id: 'tokens_count',
            header: 'Токенов',
            accessorKey: 'tokens_count',
            className: 'w-24',
        },
        {
            id: 'symbols_count',
            header: 'Символов',
            accessorKey: 'symbols_count',
            className: 'w-24',
        },
        {
            id: 'price',
            header: 'Цена',
            accessorKey: 'price',
            className: 'w-24',
        },
        {
            id: 'created_at',
            header: 'Дата создания',
            cell: (row) => {
                if (!row.createdAt) return '—';
                return new Date(row.createdAt).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            },
            className: 'w-40',
        },
        {
            id: 'updated_at',
            header: 'Дата обновления',
            cell: (row) => {
                if (!row.updatedAt) return '—';
                return new Date(row.updatedAt).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            },
            className: 'w-40',
        },
    ];

    return (
        <div className="overflow-x-auto">
            <DataTable
                data={data}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="AI записи не найдены"
                onRowClick={onRowClick}
            />
        </div>
    );
}
