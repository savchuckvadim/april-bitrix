'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import {
    formatCriteriaList,
    getClientTypeLabel,
    getSupplyTypeLabel,
} from '@/modules/entities/konstructor/lib';
import { getWordTemplateVisibilityLabel } from '../../consts/word-template.consts';
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
    onArchive?: (item: IWordTemplateSummury) => void;
    onUnarchive?: (item: IWordTemplateSummury) => void;
    /**
     * Портальный режим: колонки состояния привязки и действия с ней
     * (отключить от портала, активность/по умолчанию привязки) добавляются
     * снаружи, чтобы таблица не знала про join-таблицу.
     */
    extraColumns?: Column<IWordTemplateSummury>[];
    renderExtraActions?: (item: IWordTemplateSummury) => React.ReactNode;
    /** Скрыть «Удалить» (например, для публичных шаблонов на странице портала). */
    canDelete?: (item: IWordTemplateSummury) => boolean;
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
    onArchive,
    onUnarchive,
    extraColumns = [],
    renderExtraActions,
    canDelete,
}: WordTemplateTableProps) {
    const columns: Column<IWordTemplateSummury>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', className: 'w-24' },
        {
            id: 'name',
            header: 'Название',
            cell: (row) => (
                <span>
                    {row.name}
                    {row.is_archived && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            архив
                        </span>
                    )}
                </span>
            ),
            className: 'w-56',
        },
        {
            id: 'visibility',
            header: 'Видимость',
            cell: (row) => getWordTemplateVisibilityLabel(row.visibility),
            className: 'w-32',
        },
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
        ...extraColumns,
        { id: 'code', header: 'Код', accessorKey: 'code', className: 'w-48' },
        {
            id: 'agent_id',
            // null — «любой поставщик», а не отсутствие данных.
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
                            По умолчанию
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
                    {row.is_archived
                        ? onUnarchive && (
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
                          )
                        : onArchive && (
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
                    {renderExtraActions?.(row)}
                    {onDelete && (canDelete ? canDelete(row) : true) && (
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
            emptyMessage="Шаблоны не найдены"
            onRowClick={onRowClick}
        />
    );
}
