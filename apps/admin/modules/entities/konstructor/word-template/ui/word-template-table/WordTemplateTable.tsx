'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { IWordTemplateSummury } from '../../model';

interface WordTemplateTableProps {
    data: IWordTemplateSummury[];
    isLoading?: boolean;
    onRowClick?: (item: IWordTemplateSummury) => void;
    onEdit?: (item: IWordTemplateSummury) => void;
    onDelete?: (item: IWordTemplateSummury) => void;
    onSetActive?: (item: IWordTemplateSummury) => void;
    onSetDefault?: (item: IWordTemplateSummury) => void;
    onDownload?: (item: IWordTemplateSummury) => void;
}

export function WordTemplateTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
    onSetActive,
    onSetDefault,
    onDownload,
}: WordTemplateTableProps) {
    const columns: Column<IWordTemplateSummury>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', className: 'w-32' },
        { id: 'name', header: 'Название', accessorKey: 'name', className: 'w-56' },
        { id: 'visibility', header: 'Видимость', accessorKey: 'visibility', className: 'w-28' },
        {
            id: 'is_default',
            header: 'По умолчанию',
            cell: (row) => (row.is_default ? 'Да' : 'Нет'),
            className: 'w-24',
        },
        {
            id: 'is_active',
            header: 'Активен',
            cell: (row) => (row.is_active ? 'Да' : 'Нет'),
            className: 'w-24',
        },
        { id: 'type', header: 'Тип', accessorKey: 'type', className: 'w-24' },
        { id: 'code', header: 'Код', accessorKey: 'code', className: 'w-48' },
        { id: 'counter', header: 'Счетчик', accessorKey: 'counter', className: 'w-24' },
        {
            id: 'created_at',
            header: 'Создан',
            cell: (row) => (row.created_at ? new Date(row.created_at).toLocaleString('ru-RU') : '—'),
            className: 'w-40',
        },
        {
            id: 'actions',
            header: 'Действия',
            cell: (row) => (
                <div className="flex flex-wrap gap-2">
                    {onDownload && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(row);
                            }}
                        >
                            Скачать
                        </Button>
                    )}
                    {onSetActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetActive(row);
                            }}
                        >
                            {row.is_active ? 'Деактив.' : 'Актив.'}
                        </Button>
                    )}
                    {onSetDefault && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(row);
                            }}
                        >
                            Default
                        </Button>
                    )}
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
            className: 'w-[560px]',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Шаблоны не найдены"
            onRowClick={onRowClick}
        />
    );
}
