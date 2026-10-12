'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    clientTypesLabel,
    supplyTypesLabel,
} from '@/modules/entities/konstructor/document-template-shared';
import { getInvoiceTemplateVisibilityLabel } from '../../consts/invoice-template-form.consts';
import type { IInvoiceTemplate } from '../../model';

interface InvoiceTemplateTableProps {
    data: IInvoiceTemplate[];
    isLoading?: boolean;
    onRowClick?: (item: IInvoiceTemplate) => void;
    onEdit?: (item: IInvoiceTemplate) => void;
    onDelete?: (item: IInvoiceTemplate) => void;
    onToggleActive?: (item: IInvoiceTemplate) => void;
    onSetDefault?: (item: IInvoiceTemplate) => void;
    onArchive?: (item: IInvoiceTemplate) => void;
    onUnarchive?: (item: IInvoiceTemplate) => void;
    onDownload?: (item: IInvoiceTemplate) => void;
}

export function InvoiceTemplateTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
    onToggleActive,
    onSetDefault,
    onArchive,
    onUnarchive,
    onDownload,
}: InvoiceTemplateTableProps) {
    const columns: Column<IInvoiceTemplate>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', className: 'w-24' },
        { id: 'name', header: 'Название', accessorKey: 'name', className: 'w-56' },
        {
            id: 'visibility',
            header: 'Видимость',
            cell: (row) => getInvoiceTemplateVisibilityLabel(row.visibility),
            className: 'w-40',
        },
        {
            id: 'portal_id',
            // `portal_id IS NULL` — это «Общий», а не отсутствие данных.
            header: 'Портал',
            cell: (row) => row.portal_id ?? 'Общий',
            className: 'w-28',
        },
        {
            id: 'agent_id',
            header: 'Поставщик',
            cell: (row) => row.agent_id ?? 'Любой',
            className: 'w-28',
        },
        {
            id: 'client_types',
            header: 'Типы клиента',
            cell: (row) => clientTypesLabel(row.client_types),
            className: 'w-56',
        },
        {
            id: 'supply_types',
            header: 'Виды размещения',
            cell: (row) => supplyTypesLabel(row.supply_types),
            className: 'w-40',
        },
        {
            id: 'is_default',
            header: 'По умолчанию',
            cell: (row) => (row.is_default ? 'Да' : 'Нет'),
            className: 'w-28',
        },
        {
            id: 'is_active',
            header: 'Активен',
            cell: (row) => (row.is_active ? 'Да' : 'Нет'),
            className: 'w-24',
        },
        {
            id: 'is_archived',
            header: 'Архив',
            cell: (row) => (row.is_archived ? 'Да' : 'Нет'),
            className: 'w-24',
        },
        {
            id: 'created_at',
            header: 'Создан',
            cell: (row) =>
                row.created_at
                    ? new Date(row.created_at).toLocaleString('ru-RU')
                    : '—',
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
                    {onToggleActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleActive(row);
                            }}
                        >
                            {row.is_active ? 'Деактивировать' : 'Активировать'}
                        </Button>
                    )}
                    {onSetDefault && !row.is_default && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(row);
                            }}
                        >
                            Сделать основным
                        </Button>
                    )}
                    {/* Архив и разархивация — взаимоисключающие действия. */}
                    {onArchive && !row.is_archived && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onArchive(row);
                            }}
                        >
                            В архив
                        </Button>
                    )}
                    {onUnarchive && row.is_archived && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnarchive(row);
                            }}
                        >
                            Из архива
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
            className: 'w-[640px]',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Шаблоны счетов не найдены"
            onRowClick={onRowClick}
        />
    );
}
