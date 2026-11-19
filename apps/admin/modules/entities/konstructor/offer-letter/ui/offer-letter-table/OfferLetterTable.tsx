'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    OFFER_LETTER_COLUMN as COLUMN,
    OFFER_LETTER_TEXT as TEXT,
} from '../../consts/offer-letter.consts';
import {
    formatOfferLetterDate,
    offerLetterDefaultHint,
    offerLetterOwnerLabel,
} from '../../lib/offer-letter-view';
import type { OfferLetter } from '../../model';

interface OfferLetterTableProps {
    data: OfferLetter[];
    /** Имена менеджеров по Bitrix-id для личных писем */
    managerNames: ReadonlyMap<number, string>;
    isLoading?: boolean;
    emptyMessage: string;
    /** Письмо, над которым идёт запись: его переключатели на это время выключены */
    pendingId: string | null;
    onToggleActive: (letter: OfferLetter, isActive: boolean) => void;
    onSetDefault: (letter: OfferLetter) => void;
    onEdit: (letter: OfferLetter) => void;
    onDelete: (letter: OfferLetter) => void;
}

/** Письма портала: переключатели «активно» и «по умолчанию», правка и удаление */
export function OfferLetterTable({
    data,
    managerNames,
    isLoading,
    emptyMessage,
    pendingId,
    onToggleActive,
    onSetDefault,
    onEdit,
    onDelete,
}: OfferLetterTableProps) {
    const columns: Column<OfferLetter>[] = [
        {
            id: 'name',
            header: COLUMN.name,
            cell: row => (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{row.name}</span>
                    {row.isDefault ? <Badge variant="secondary">{TEXT.defaultBadge}</Badge> : null}
                </div>
            ),
        },
        {
            id: 'scope',
            header: COLUMN.scope,
            cell: row => offerLetterOwnerLabel(row, managerNames, TEXT.portalScope),
            className: 'w-56',
        },
        {
            id: 'isActive',
            header: COLUMN.isActive,
            cell: row => (
                <Switch
                    checked={row.isActive}
                    disabled={pendingId === row.id}
                    aria-label={`${COLUMN.isActive}: ${row.name}`}
                    onCheckedChange={checked => onToggleActive(row, checked)}
                />
            ),
            className: 'w-24',
        },
        {
            id: 'isDefault',
            header: COLUMN.isDefault,
            cell: row => (
                <Switch
                    checked={row.isDefault}
                    disabled={row.isDefault || !row.isActive || pendingId === row.id}
                    title={offerLetterDefaultHint(row)}
                    aria-label={`${COLUMN.isDefault}: ${row.name}`}
                    onCheckedChange={() => onSetDefault(row)}
                />
            ),
            className: 'w-32',
        },
        { id: 'sort', header: COLUMN.sort, accessorKey: 'sort', className: 'w-24' },
        {
            id: 'updatedAt',
            header: COLUMN.updatedAt,
            cell: row => formatOfferLetterDate(row.updatedAt),
            className: 'w-44',
        },
        {
            id: 'actions',
            header: COLUMN.actions,
            cell: row => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                        <Pencil />
                        {TEXT.edit}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>
                        <Trash2 />
                        {TEXT.remove}
                    </Button>
                </div>
            ),
            className: 'w-64',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
        />
    );
}
