'use client';

import { Button } from '@workspace/ui/components/button';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import { PUBLIC_LINK_STATUS_LABEL } from '../../consts/public-link.consts';
import {
    formatPublicLinkDate,
    formatPublicLinkExpiry,
} from '../../lib/public-link-view';
import type { PublicLink } from '../../model';

interface PublicLinkTableProps {
    data: PublicLink[];
    isLoading?: boolean;
    isCopied: (link: PublicLink) => boolean;
    onCopy: (link: PublicLink) => void;
    onRevoke: (link: PublicLink) => void;
}

export function PublicLinkTable({
    data,
    isLoading,
    isCopied,
    onCopy,
    onRevoke,
}: PublicLinkTableProps) {
    const columns: Column<PublicLink>[] = [
        { id: 'title', header: 'Название', accessorKey: 'title' },
        { id: 'domain', header: 'Портал каталога', accessorKey: 'domain' },
        {
            id: 'status',
            header: 'Статус',
            cell: row => PUBLIC_LINK_STATUS_LABEL[row.status],
            className: 'w-28',
        },
        {
            id: 'expiresAt',
            header: 'Срок',
            cell: row => formatPublicLinkExpiry(row.expiresAt),
            className: 'w-28',
        },
        {
            id: 'viewCount',
            header: 'Открывали',
            accessorKey: 'viewCount',
            className: 'w-24',
        },
        {
            id: 'lastViewedAt',
            header: 'В последний раз',
            cell: row => formatPublicLinkDate(row.lastViewedAt),
            className: 'w-40',
        },
        {
            id: 'createdAt',
            header: 'Создана',
            cell: row => formatPublicLinkDate(row.createdAt),
            className: 'w-40',
        },
        {
            id: 'actions',
            header: 'Действия',
            cell: row =>
                row.status === 'active' ? (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCopy(row)}
                        >
                            {isCopied(row) ? 'Скопировано' : 'Копировать'}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onRevoke(row)}
                        >
                            Отозвать
                        </Button>
                    </div>
                ) : null,
            className: 'w-56',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Ссылок пока нет"
        />
    );
}
