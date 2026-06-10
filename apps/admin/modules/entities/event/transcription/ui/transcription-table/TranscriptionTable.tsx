'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { TranscriptionEntity } from '../../model';

interface TranscriptionTableProps {
    data: TranscriptionEntity[];
    isLoading?: boolean;
    onRowClick?: (item: TranscriptionEntity) => void;
}

export function TranscriptionTable({
    data,
    isLoading,
    onRowClick,
}: TranscriptionTableProps) {
    const columns: Column<TranscriptionEntity>[] = [
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
            id: 'userName',
            header: 'Пользователь',
            accessorKey: 'userName',
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
            id: 'entityType',
            header: 'Тип сущности',
            accessorKey: 'entityType',
            className: 'w-32',
        },
        {
            id: 'entityName',
            header: 'Название сущности',
            accessorKey: 'entityName',
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
            id: 'text',
            header: 'Текст',
            cell: (row) => (
                <div className="max-w-md truncate" title={row.text}>
                    {row.text || '—'}
                </div>
            ),
            className: 'w-64',
        },
        {
            id: 'duration',
            header: 'Длительность',
            accessorKey: 'duration',
            className: 'w-24',
        },
        {
            id: 'symbolsCount',
            header: 'Символов',
            accessorKey: 'symbolsCount',
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
            header: 'Создано',
            cell: (row) => {
                if (!row.created_at) return '—';
                return new Date(row.created_at).toLocaleString('ru-RU');
            },
            className: 'w-40',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Транскрипции не найдены"
            onRowClick={onRowClick}
        />
    );
}
