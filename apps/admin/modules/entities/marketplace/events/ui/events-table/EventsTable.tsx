'use client';

import * as React from 'react';
import { AppEventDto } from '@workspace/nest-admin-api';
import { DataTable, Column } from '@/modules/shared';
import { EventStatusBadge, formatDateTime, truncate } from '../../../shared';

interface EventsTableProps {
    data: AppEventDto[];
    isLoading?: boolean;
}

/** Таблица журнала событий: payload/errorDetail разворачиваются по клику на строку. */
export function EventsTable({ data, isLoading }: EventsTableProps) {
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

    const toggleRow = (row: AppEventDto) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(row.id)) {
                next.delete(row.id);
            } else {
                next.add(row.id);
            }
            return next;
        });
    };

    const columns: Column<AppEventDto>[] = [
        {
            id: 'createdAt',
            header: 'Когда',
            cell: (row) => formatDateTime(row.createdAt),
            className: 'w-40',
        },
        {
            id: 'event',
            header: 'Событие',
            cell: (row) => <span className="font-mono text-xs">{row.event}</span>,
            className: 'w-56',
        },
        {
            id: 'status',
            header: 'Статус',
            cell: (row) => (
                <EventStatusBadge status={row.status} title={row.errorDetail} />
            ),
            className: 'w-32',
        },
        {
            id: 'domain',
            header: 'Домен',
            cell: (row) => row.domain || '—',
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
            id: 'payload',
            header: 'Payload / ошибка',
            cell: (row) => {
                const expanded = expandedIds.has(row.id);
                const payloadText = row.payload || '';
                const errorText = row.errorDetail || '';
                if (!payloadText && !errorText) return '—';

                if (!expanded) {
                    return (
                        <span
                            className="text-xs text-muted-foreground"
                            title="Кликните по строке, чтобы развернуть"
                        >
                            {truncate(errorText || payloadText, 60)}
                        </span>
                    );
                }
                return (
                    <div className="space-y-1 text-xs max-w-xl">
                        {payloadText && (
                            <pre className="whitespace-pre-wrap break-all font-mono bg-muted rounded p-2">
                                {payloadText}
                            </pre>
                        )}
                        {errorText && (
                            <pre className="whitespace-pre-wrap break-all font-mono text-red-600 dark:text-red-400 bg-red-500/10 rounded p-2">
                                {errorText}
                            </pre>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="События не найдены"
            onRowClick={toggleRow}
        />
    );
}
