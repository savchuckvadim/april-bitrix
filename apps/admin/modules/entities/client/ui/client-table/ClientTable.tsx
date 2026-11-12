'use client';

import { ClientResponseDto } from '@workspace/nest-admin-api';
import { Button } from '@workspace/ui/components/button';
import { DataTable, Column } from '@/modules/shared/ui/data-table';

interface ClientTableProps {
    data: ClientResponseDto[];
    /** Домены порталов по id клиента. */
    portalsByClient: ReadonlyMap<number, string[]>;
    isLoading?: boolean;
    onRowClick?: (item: ClientResponseDto) => void;
    onEdit?: (item: ClientResponseDto) => void;
}

const formatDate = (value: string | null | undefined): string =>
    value ? new Date(value).toLocaleDateString('ru-RU') : '—';

/**
 * Клиенты (организации): название, email, порталы, статус. Удаления нет:
 * у порталов клиента в БД каскадное удаление.
 */
export function ClientTable({ data, portalsByClient, isLoading, onRowClick, onEdit }: ClientTableProps) {
    const columns: Column<ClientResponseDto>[] = [
        {
            id: 'name',
            header: 'Организация',
            cell: row => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-muted-foreground">#{row.id}</div>
                </div>
            ),
        },
        {
            id: 'email',
            header: 'Email',
            cell: row => row.email ?? <span className="text-muted-foreground">—</span>,
        },
        {
            id: 'portals',
            header: 'Порталы',
            cell: row => {
                const domains = portalsByClient.get(Number(row.id)) ?? [];
                return domains.length ? (
                    <div className="space-y-0.5 text-sm">
                        {domains.map(domain => (
                            <div key={domain}>{domain}</div>
                        ))}
                    </div>
                ) : (
                    <span className="text-sm text-warning">нет портала</span>
                );
            },
        },
        {
            id: 'status',
            header: 'Статус',
            cell: row => (row.is_active === false ? 'отключён' : (row.status ?? 'действует')),
            className: 'w-32',
        },
        {
            id: 'created_at',
            header: 'Заведён',
            cell: row => formatDate(row.created_at as string | null | undefined),
            className: 'w-28',
        },
        {
            id: 'actions',
            header: '',
            cell: row =>
                onEdit ? (
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
                ) : null,
            className: 'w-28',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Клиентов пока нет"
            onRowClick={onRowClick}
        />
    );
}
