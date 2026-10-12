'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    formatCriteriaList,
    formatSupplyReportFieldList,
    getClientTypeLabel,
    getSupplyTypeLabel,
} from '@/modules/entities/konstructor/lib';
import type { ISupplyReportTemplateSummary } from '../../model';

interface SupplyReportTemplateTableProps {
    data: ISupplyReportTemplateSummary[];
    isLoading?: boolean;
    onRowClick?: (item: ISupplyReportTemplateSummary) => void;
    onEdit?: (item: ISupplyReportTemplateSummary) => void;
    onDelete?: (item: ISupplyReportTemplateSummary) => void;
    onSetActive?: (item: ISupplyReportTemplateSummary) => void;
    onSetDefault?: (item: ISupplyReportTemplateSummary) => void;
    onArchive?: (item: ISupplyReportTemplateSummary) => void;
    onDownload?: (item: ISupplyReportTemplateSummary) => void;
}

const formatDate = (value?: string | null): string =>
    value ? new Date(value).toLocaleString('ru-RU') : '—';

const yesNo = (value: boolean): string => (value ? 'Да' : 'Нет');

export function SupplyReportTemplateTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
    onSetActive,
    onSetDefault,
    onArchive,
    onDownload,
}: SupplyReportTemplateTableProps) {
    const columns: Column<ISupplyReportTemplateSummary>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', className: 'w-20' },
        { id: 'name', header: 'Название', accessorKey: 'name', className: 'w-56' },
        { id: 'code', header: 'Код', accessorKey: 'code', className: 'w-48' },
        {
            id: 'portal_id',
            // portal_id IS NULL — это «Общий», а не отсутствие данных.
            header: 'Портал',
            cell: (row) => row.portal_id ?? 'Общий',
            className: 'w-24',
        },
        {
            id: 'agent_id',
            header: 'Поставщик',
            cell: (row) => row.agent_id ?? 'Любой',
            className: 'w-24',
        },
        {
            id: 'client_types',
            header: 'Типы клиента',
            cell: (row) => formatCriteriaList(row.client_types, getClientTypeLabel),
            className: 'w-48',
        },
        {
            id: 'supply_types',
            header: 'Виды размещения',
            cell: (row) => formatCriteriaList(row.supply_types, getSupplyTypeLabel),
            className: 'w-40',
        },
        {
            id: 'required_fields',
            header: 'Обязательные поля',
            cell: (row) => formatSupplyReportFieldList(row.required_fields),
            className: 'w-56',
        },
        {
            id: 'optional_fields',
            header: 'Необязательные поля',
            cell: (row) => formatSupplyReportFieldList(row.optional_fields),
            className: 'w-56',
        },
        {
            id: 'description',
            header: 'Описание',
            cell: (row) => row.description ?? '—',
            className: 'w-48',
        },
        {
            id: 'template_url',
            header: 'Файл',
            cell: (row) => (row.template_url ? 'Загружен' : '—'),
            className: 'w-24',
        },
        {
            id: 'demo_url',
            header: 'Демо',
            cell: (row) => (row.demo_url ? 'Есть' : '—'),
            className: 'w-20',
        },
        {
            id: 'is_default',
            header: 'По умолчанию',
            cell: (row) => yesNo(row.is_default),
            className: 'w-24',
        },
        {
            id: 'is_active',
            header: 'Активен',
            cell: (row) => yesNo(row.is_active),
            className: 'w-20',
        },
        {
            id: 'is_archived',
            header: 'В архиве',
            cell: (row) => yesNo(row.is_archived),
            className: 'w-20',
        },
        {
            id: 'archived_at',
            header: 'Архивирован',
            cell: (row) => formatDate(row.archived_at),
            className: 'w-36',
        },
        {
            id: 'creator_bitrix_user_id',
            header: 'Создал (Битрикс)',
            cell: (row) => row.creator_bitrix_user_id ?? '—',
            className: 'w-28',
        },
        {
            id: 'created_at',
            header: 'Создан',
            cell: (row) => formatDate(row.created_at),
            className: 'w-36',
        },
        {
            id: 'updated_at',
            header: 'Изменён',
            cell: (row) => formatDate(row.updated_at),
            className: 'w-36',
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
                            onClick={(event) => {
                                event.stopPropagation();
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
                            onClick={(event) => {
                                event.stopPropagation();
                                onSetActive(row);
                            }}
                        >
                            {row.is_active ? 'Выключить' : 'Включить'}
                        </Button>
                    )}
                    {onSetDefault && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={row.is_default}
                            onClick={(event) => {
                                event.stopPropagation();
                                onSetDefault(row);
                            }}
                        >
                            По умолчанию
                        </Button>
                    )}
                    {onArchive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                                event.stopPropagation();
                                onArchive(row);
                            }}
                        >
                            {row.is_archived ? 'Из архива' : 'В архив'}
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                                event.stopPropagation();
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
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete(row);
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            ),
            className: 'w-[620px]',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Шаблоны отчётов о поставке не найдены"
            onRowClick={onRowClick}
        />
    );
}
