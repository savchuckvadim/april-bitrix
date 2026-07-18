'use client';

import * as React from 'react';
import { AdminMarketplaceInstallDto } from '@workspace/nest-admin-api';
import { DataTable, Column } from '@/modules/shared';
import {
    InstallStatusBadge,
    StatusBadge,
    formatDateTime,
    truncate,
} from '../../../shared';

interface InstallsTableProps {
    data: AdminMarketplaceInstallDto[];
    isLoading?: boolean;
    onRowClick?: (item: AdminMarketplaceInstallDto) => void;
}

/** Таблица установок маркетплейс-приложения. */
export function InstallsTable({ data, isLoading, onRowClick }: InstallsTableProps) {
    const columns: Column<AdminMarketplaceInstallDto>[] = [
        {
            id: 'domain',
            header: 'Домен',
            cell: (row) => <span className="font-medium">{row.domain || '—'}</span>,
        },
        {
            id: 'memberId',
            header: 'member_id',
            cell: (row) => (
                <span className="font-mono text-xs" title={row.memberId}>
                    {truncate(row.memberId, 12)}
                </span>
            ),
            className: 'w-32',
        },
        {
            id: 'installStatus',
            header: 'Статус',
            cell: (row) => (
                <InstallStatusBadge status={row.installStatus} title={row.errorDetail} />
            ),
            className: 'w-40',
        },
        {
            id: 'errorStep',
            header: 'Ошибка',
            cell: (row) =>
                row.errorStep ? (
                    <span
                        className="text-red-600 dark:text-red-400 text-xs"
                        title={row.errorDetail}
                    >
                        {truncate(row.errorStep, 24)}
                    </span>
                ) : (
                    '—'
                ),
            className: 'w-36',
        },
        {
            id: 'version',
            header: 'Версия',
            cell: (row) => row.version || '—',
            className: 'w-20',
        },
        {
            id: 'installedAt',
            header: 'Установлено',
            cell: (row) => formatDateTime(row.installedAt),
            className: 'w-40',
        },
        {
            id: 'uninstalledAt',
            header: 'Удалено',
            cell: (row) =>
                row.uninstalledAt ? (
                    <StatusBadge color="red" title={formatDateTime(row.uninstalledAt)}>
                        Удалено
                    </StatusBadge>
                ) : (
                    '—'
                ),
            className: 'w-28',
        },
        {
            id: 'componentsCount',
            header: 'Компонентов',
            accessorKey: 'componentsCount',
            className: 'w-28',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Установки не найдены"
            onRowClick={onRowClick}
        />
    );
}
