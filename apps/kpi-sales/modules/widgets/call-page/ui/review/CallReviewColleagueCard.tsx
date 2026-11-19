'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { formatScore, scoreTone } from '@/modules/entities/call-page';
import {
    CALL_REVIEW_ROLE_TEXT,
    CALL_REVIEW_TEXT,
    formatCallReviewMoment,
    type CallReview,
} from '@/modules/entities/call-review';
import { CallReviewItemsList } from './CallReviewItemsList';
import { CallReviewLongText } from './CallReviewLongText';

const T = CALL_REVIEW_TEXT.colleagues;

/**
 * Отзыв коллеги: кто и в какой роли, оценка, согласен ли с AI, пункты
 * «не так», комментарий (длинный свёрнут), когда оставлен.
 */
export const CallReviewColleagueCard = ({ review }: { review: CallReview }) => {
    const when = formatCallReviewMoment(review.createdAt);
    return (
        <li className="space-y-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{review.authorName || T.noName}</span>
                <span className="text-xs text-muted-foreground">
                    {CALL_REVIEW_ROLE_TEXT[review.authorRole]}
                </span>
                <ToneBadge tone={review.agree ? 'success' : 'destructive'} variant="soft" size="sm">
                    {review.agree ? T.agree : T.disagree}
                </ToneBadge>
                {review.leaderScore !== null && (
                    <ToneBadge tone={scoreTone(review.leaderScore)} variant="soft" size="sm">
                        {T.score(formatScore(review.leaderScore))}
                    </ToneBadge>
                )}
                {when && <span className="ml-auto text-xs text-muted-foreground">{when}</span>}
            </div>
            <CallReviewItemsList items={review.items} />
            {review.comment && <CallReviewLongText text={review.comment} />}
        </li>
    );
};
