'use client';

/**
 * Таблица шаблонов договора.
 *
 * Колонки `contract_type`, `client_types`, `supply_types` показываются
 * РУССКИМИ подписями через общий словарный модуль: сырые коды
 * (`org_state`, `proxima`) в админке нечитаемы. Пустой список выводится
 * как «Любой» — это значение NULL на бэкенде, то есть «подходит любому»,
 * а не «не заполнено».
 */
import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    formatCriteriaList,
    getClientTypeLabel,
    getContractLtypeLabel,
    getSupplyTypeLabel,
    getTemplateScopeLabel,
} from '@/modules/entities/konstructor/lib';
import type { IContractTemplate } from '../../model';
import { scopeOfTemplate } from '../../lib/utils';

interface ContractTemplateTableProps {
    data: IContractTemplate[];
    isLoading?: boolean;
    onRowClick?: (item: IContractTemplate) => void;
    onEdit?: (item: IContractTemplate) => void;
    onDelete?: (item: IContractTemplate) => void;
    onSetActive?: (item: IContractTemplate) => void;
    onSetDefault?: (item: IContractTemplate) => void;
    onToggleArchive?: (item: IContractTemplate) => void;
    onDownload?: (item: IContractTemplate) => void;
}

export function ContractTemplateTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
    onSetActive,
    onSetDefault,
    onToggleArchive,
    onDownload,
}: ContractTemplateTableProps) {
    const columns: Column<IContractTemplate>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', className: 'w-20' },
        { id: 'name', header: 'Название', accessorKey: 'name', className: 'w-56' },
        {
            id: 'contract_type',
            header: 'Тип договора',
            cell: row => getContractLtypeLabel(row.contract_type),
            className: 'w-44',
        },
        {
            id: 'client_types',
            header: 'Типы клиента',
            cell: row => formatCriteriaList(row.client_types, getClientTypeLabel),
            className: 'w-56',
        },
        {
            id: 'supply_types',
            header: 'Типы поставки',
            cell: row => formatCriteriaList(row.supply_types, getSupplyTypeLabel),
            className: 'w-40',
        },
        {
            id: 'scope',
            header: 'Область',
            // «Общий» = portal_id IS NULL; остальное выводится из пары
            // (portal_id, agent_id) — колонки visibility у таблицы нет.
            cell: row => getTemplateScopeLabel(scopeOfTemplate(row)),
            className: 'w-48',
        },
        {
            id: 'is_default',
            header: 'По умолчанию',
            cell: row => (row.is_default ? 'Да' : 'Нет'),
            className: 'w-28',
        },
        {
            id: 'state',
            header: 'Состояние',
            cell: row => (
                <div className="flex flex-wrap gap-1">
                    <Badge variant={row.is_active ? 'default' : 'secondary'}>
                        {row.is_active ? 'Активен' : 'Выключен'}
                    </Badge>
                    {row.is_archived && <Badge variant="outline">В архиве</Badge>}
                </div>
            ),
            className: 'w-36',
        },
        {
            id: 'created_at',
            header: 'Создан',
            cell: row =>
                row.created_at ? new Date(row.created_at).toLocaleString('ru-RU') : '—',
            className: 'w-40',
        },
        {
            id: 'actions',
            header: 'Действия',
            cell: row => (
                <div className="flex flex-wrap gap-2">
                    {onDownload && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={event => {
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
                            onClick={event => {
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
                            disabled={row.is_archived}
                            onClick={event => {
                                event.stopPropagation();
                                onSetDefault(row);
                            }}
                        >
                            {row.is_default ? 'Снять по умолч.' : 'По умолчанию'}
                        </Button>
                    )}
                    {onToggleArchive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={event => {
                                event.stopPropagation();
                                onToggleArchive(row);
                            }}
                        >
                            {row.is_archived ? 'Из архива' : 'В архив'}
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={event => {
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
                            onClick={event => {
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
            emptyMessage="Шаблоны договоров не найдены"
            onRowClick={onRowClick}
        />
    );
}
