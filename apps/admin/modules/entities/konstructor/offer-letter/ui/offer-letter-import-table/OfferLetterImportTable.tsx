'use client';

import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import { OFFER_LETTER_IMPORT_STATUS_LABEL } from '../../consts/offer-letter.consts';
import { yesNo } from '../../lib/offer-letter-view';
import type { OfferLetterImportItem } from '../../model';

interface OfferLetterImportTableProps {
    data: OfferLetterImportItem[];
}

const COLUMNS: Column<OfferLetterImportItem>[] = [
    { id: 'domain', header: 'Портал', accessorKey: 'domain' },
    { id: 'length', header: 'Символов', accessorKey: 'length', className: 'w-24' },
    {
        id: 'enabled',
        header: 'Включено в легаси',
        cell: row => yesNo(row.enabled),
        className: 'w-36',
    },
    {
        id: 'isDefault',
        header: 'По умолчанию',
        cell: row => yesNo(row.isDefault),
        className: 'w-32',
    },
    {
        id: 'status',
        header: 'Статус',
        cell: row => OFFER_LETTER_IMPORT_STATUS_LABEL[row.status],
        className: 'w-44',
    },
];

/** Письма порталов из легаси и что ручка с каждым сделала */
export function OfferLetterImportTable({ data }: OfferLetterImportTableProps) {
    return <DataTable data={data} columns={COLUMNS} emptyMessage="Писем не найдено" />;
}
