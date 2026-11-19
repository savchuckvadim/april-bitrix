'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { CALL_REVIEWS_TEXT } from '../../../consts/call-reviews.const';
import { scoreChangeLabel } from '../../../lib/call-reviews-format.util';
import type { CallReviewRow } from '../../../model';

interface ReviewScoreCellProps {
    row: CallReviewRow;
}

/** Оценка AI → оценка руководителя и согласие бэйджем. */
export const ReviewScoreCell = ({ row }: ReviewScoreCellProps) => (
    <div className="space-y-1 whitespace-nowrap text-sm">
        <div className="tabular-nums">{scoreChangeLabel(row.aiScore, row.leaderScore)}</div>
        <ToneBadge tone={row.agree ? 'success' : 'destructive'} variant="soft" size="sm">
            {row.agree ? CALL_REVIEWS_TEXT.agreeYes : CALL_REVIEWS_TEXT.agreeNo}
        </ToneBadge>
    </div>
);
