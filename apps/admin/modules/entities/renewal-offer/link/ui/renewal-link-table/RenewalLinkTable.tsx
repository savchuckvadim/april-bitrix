'use client';

import { Button } from '@workspace/ui/components/button';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import { RENEWAL_LINK_STATUS_LABEL } from '../../consts/renewal-link.consts';
import {
    formatRenewalLinkDate,
    formatRenewalLinkExpiry,
    formatRub,
    renewalOfferSummary,
    renewalPdfUrl,
} from '../../lib/renewal-link-view';
import type { RenewalLink } from '../../model';

interface RenewalLinkTableProps {
    data: RenewalLink[];
    isLoading?: boolean;
    isCopied: (link: RenewalLink) => boolean;
    onCopy: (link: RenewalLink) => void;
    onRevoke: (link: RenewalLink) => void;
}

/**
 * Какие предложения и с какими ценами выданы. Сумма и состав — в строке,
 * чтобы не открывать каждую ссылку ради проверки, что ушло клиенту.
 */
export function RenewalLinkTable({
    data,
    isLoading,
    isCopied,
    onCopy,
    onRevoke,
}: RenewalLinkTableProps) {
    const columns: Column<RenewalLink>[] = [
        { id: 'clientName', header: 'Клиент', accessorKey: 'clientName' },
        {
            id: 'monthlyTotal',
            header: 'В месяц',
            cell: row => formatRub(row.monthlyTotal),
            className: 'w-28',
        },
        {
            id: 'offer',
            header: 'Что включено',
            cell: row => (
                <span className="text-xs text-muted-foreground">
                    {renewalOfferSummary(row.offer)}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Статус',
            cell: row => RENEWAL_LINK_STATUS_LABEL[row.status],
            className: 'w-28',
        },
        {
            id: 'expiresAt',
            header: 'Срок',
            cell: row => formatRenewalLinkExpiry(row.expiresAt),
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
            cell: row => formatRenewalLinkDate(row.lastViewedAt),
            className: 'w-40',
        },
        {
            id: 'title',
            header: 'Пометка',
            cell: row => (
                <span className="text-xs text-muted-foreground">
                    {row.title || '—'}
                </span>
            ),
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
                        <Button size="sm" variant="outline" asChild>
                            <a
                                href={renewalPdfUrl(row.token)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                PDF
                            </a>
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
            className: 'w-64',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Предложений пока нет"
        />
    );
}
