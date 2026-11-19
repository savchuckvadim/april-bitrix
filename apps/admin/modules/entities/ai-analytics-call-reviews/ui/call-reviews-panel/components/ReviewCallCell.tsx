'use client';

import { CALL_REVIEWS_TEXT } from '../../../consts/call-reviews.const';
import { formatMoscowDateTime } from '../../../lib/call-reviews-format.util';
import type { CallReviewRow } from '../../../model';

interface ReviewCallCellProps {
    row: CallReviewRow;
}

/** Звонок: публичная страница разбора в новой вкладке и начало звонка. */
export const ReviewCallCell = ({ row }: ReviewCallCellProps) => (
    <div className="space-y-0.5 text-sm">
        {row.callUrl ? (
            <a
                href={row.callUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
            >
                {CALL_REVIEWS_TEXT.openCall} {row.transcriptionId}
            </a>
        ) : (
            <span>
                {row.transcriptionId}{' '}
                <span className="text-muted-foreground">({CALL_REVIEWS_TEXT.noLink})</span>
            </span>
        )}
        {row.callStartedAt && (
            <div className="text-xs text-muted-foreground">{formatMoscowDateTime(row.callStartedAt)}</div>
        )}
    </div>
);
