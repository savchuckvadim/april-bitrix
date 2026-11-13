'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { TranscriptionListItem } from '../../model';
import {
    durationLabel,
    transcriptionProviderLabel,
    transcriptionStatusLabel,
} from '../../lib/transcription-labels';

interface TranscriptionTableProps {
    data: TranscriptionListItem[];
    isLoading?: boolean;
    /** Список одного портала — колонка портала не нужна. */
    hideDomain?: boolean;
    onRowClick?: (item: TranscriptionListItem) => void;
}

const dateLabel = (value: string | null): string =>
    value ? new Date(value).toLocaleString('ru-RU') : '—';

/** Строки списка транскрипций — без текста: он открывается в карточке. */
export function TranscriptionTable({
    data,
    isLoading,
    hideDomain,
    onRowClick,
}: TranscriptionTableProps) {
    const columns: Column<TranscriptionListItem>[] = [
        {
            id: 'createdAt',
            header: 'Распознано',
            cell: row => dateLabel(row.createdAt),
            className: 'w-40',
        },
        ...(hideDomain
            ? []
            : [{ id: 'domain', header: 'Портал', accessorKey: 'domain' as const }]),
        {
            id: 'userName',
            header: 'Сотрудник',
            cell: row => row.userName ?? row.userId ?? '—',
        },
        {
            id: 'entity',
            header: 'Сделка / клиент',
            cell: row => (
                <div className="max-w-xs truncate" title={row.entityName ?? undefined}>
                    {row.entityName ?? (row.entityId ? `${row.entityType ?? ''} ${row.entityId}` : '—')}
                </div>
            ),
        },
        {
            id: 'provider',
            header: 'Распознаватель',
            cell: row => transcriptionProviderLabel(row.provider),
        },
        {
            id: 'status',
            header: 'Статус',
            cell: row => transcriptionStatusLabel(row.status),
        },
        {
            id: 'durationSec',
            header: 'Длительность',
            cell: row => durationLabel(row.durationSec),
            className: 'w-28 text-right',
        },
        {
            id: 'symbolsCount',
            header: 'Символов',
            cell: row => row.symbolsCount?.toLocaleString('ru-RU') ?? '—',
            className: 'w-24 text-right',
        },
        {
            id: 'app',
            header: 'Приложение',
            cell: row => row.app ?? '—',
        },
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20 text-muted-foreground',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Транскрипций под фильтром нет"
            onRowClick={onRowClick}
        />
    );
}
