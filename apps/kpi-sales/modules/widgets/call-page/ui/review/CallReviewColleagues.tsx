'use client';

import { CALL_REVIEW_TEXT, type CallReview } from '@/modules/entities/call-review';
import { CallReviewColleagueCard } from './CallReviewColleagueCard';

const T = CALL_REVIEW_TEXT.colleagues;

/** «Отзывы коллег» — другие руководители по этому звонку, новые сверху. */
export const CallReviewColleagues = ({ reviews }: { reviews: CallReview[] }) => (
    <section className="space-y-2 border-t border-border pt-3">
        <h3 className="text-sm font-semibold">{T.title}</h3>
        {reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground">{T.empty}</p>
        ) : (
            <ul className="space-y-3">
                {reviews.map(review => (
                    <CallReviewColleagueCard
                        key={`${review.authorName}-${review.createdAt}`}
                        review={review}
                    />
                ))}
            </ul>
        )}
    </section>
);
