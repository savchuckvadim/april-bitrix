'use client';

import * as React from 'react';
import { ApplicationDto } from '@workspace/nest-admin-api';
import { DataTable, Column } from '@/modules/shared';
import {
    ApprovalStatusBadge,
    InstallStatusBadge,
    TokenStateBadge,
} from '../../../shared';

interface ApplicationsTableProps {
    data: ApplicationDto[];
    isLoading?: boolean;
    onRowClick?: (item: ApplicationDto) => void;
}

const CLIENT_STATUS_LABELS: Record<string, string> = {
    pending: 'Ожидает',
    active: 'Активен',
    disabled: 'Отключён',
};

/** Таблица заявок маркетплейс-порталов. */
export function ApplicationsTable({ data, isLoading, onRowClick }: ApplicationsTableProps) {
    const columns: Column<ApplicationDto>[] = [
        {
            id: 'domain',
            header: 'Домен',
            cell: (row) => <span className="font-medium">{row.domain || '—'}</span>,
        },
        {
            id: 'organizationName',
            header: 'Организация',
            cell: (row) => row.organizationName || '—',
        },
        {
            id: 'contactEmail',
            header: 'Email',
            cell: (row) => row.contactEmail || '—',
        },
        {
            id: 'approvalStatus',
            header: 'Допуск',
            cell: (row) => <ApprovalStatusBadge status={row.approvalStatus} />,
            className: 'w-32',
        },
        {
            id: 'clientStatus',
            header: 'Клиент',
            cell: (row) =>
                row.clientStatus
                    ? CLIENT_STATUS_LABELS[row.clientStatus] ?? row.clientStatus
                    : '—',
            className: 'w-28',
        },
        {
            id: 'installStatus',
            header: 'Установка',
            cell: (row) => <InstallStatusBadge status={row.installStatus} />,
            className: 'w-40',
        },
        {
            id: 'token',
            header: 'Токен',
            cell: (row) => (
                <TokenStateBadge
                    tokenExpiresAt={row.tokenExpiresAt}
                    hasRefreshToken={row.hasRefreshToken}
                />
            ),
            className: 'w-44',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Заявки не найдены"
            onRowClick={onRowClick}
        />
    );
}
