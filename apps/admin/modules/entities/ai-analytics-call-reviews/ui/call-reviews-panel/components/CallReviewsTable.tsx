'use client';

import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import { CALL_REVIEWS_TEXT } from '../../../consts/call-reviews.const';
import { formatMoscowDateTime, managerLabel } from '../../../lib/call-reviews-format.util';
import type { CallReviewRow } from '../../../model';
import { ReviewCallCell } from './ReviewCallCell';
import { ReviewComment } from './ReviewComment';
import { ReviewItems } from './ReviewItems';
import { ReviewScoreCell } from './ReviewScoreCell';

interface CallReviewsTableProps {
    rows: CallReviewRow[];
    isLoading: boolean;
}

const COLUMNS: Column<CallReviewRow>[] = [
    {
        id: 'createdAt',
        header: 'Отзыв',
        cell: row => <span className="whitespace-nowrap">{formatMoscowDateTime(row.createdAt)}</span>,
        className: 'w-36',
    },
    { id: 'call', header: 'Звонок', cell: row => <ReviewCallCell row={row} /> },
    { id: 'manager', header: 'Менеджер', cell: row => managerLabel(row.managerName, row.managerId) },
    {
        id: 'author',
        header: 'Автор',
        cell: row => (
            <div className="text-sm">
                <div>{row.authorName || '—'}</div>
                <div className="text-xs text-muted-foreground">{row.authorRoleTitle}</div>
            </div>
        ),
    },
    { id: 'scores', header: 'Оценка', cell: row => <ReviewScoreCell row={row} /> },
    { id: 'items', header: 'Что «не так»', cell: row => <ReviewItems items={row.items} /> },
    { id: 'comment', header: 'Комментарий', cell: row => <ReviewComment comment={row.comment} /> },
];

/** Таблица отзывов страницы. */
export const CallReviewsTable = ({ rows, isLoading }: CallReviewsTableProps) => (
    <DataTable data={rows} columns={COLUMNS} isLoading={isLoading} emptyMessage={CALL_REVIEWS_TEXT.empty} />
);
