'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { CALL_REVIEWS_TEXT } from '../../../consts/call-reviews.const';
import { toSummaryView } from '../../../lib/call-reviews-summary.util';
import type { CallReviewsSummary as CallReviewsSummaryData } from '../../../model';
import { CountList } from './CountList';
import { SummaryStatCard } from './SummaryStatCard';

interface CallReviewsSummaryProps {
    summary: CallReviewsSummaryData;
}

/** Сводка за период: карточки чисел, «не так» по видам и частые пункты. */
export const CallReviewsSummary = ({ summary }: CallReviewsSummaryProps) => {
    const view = toSummaryView(summary);
    return (
        <SectionCard
            title={CALL_REVIEWS_TEXT.summaryTitle}
            description={CALL_REVIEWS_TEXT.summaryHint}
            contentClassName="space-y-4"
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {view.stats.map(stat => (
                    <SummaryStatCard key={stat.label} stat={stat} />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <CountList
                    title={CALL_REVIEWS_TEXT.kindsTitle}
                    rows={view.kinds}
                    emptyText={CALL_REVIEWS_TEXT.topEmpty}
                />
                <CountList
                    title={CALL_REVIEWS_TEXT.topTitle}
                    rows={view.top}
                    emptyText={CALL_REVIEWS_TEXT.topEmpty}
                />
            </div>
        </SectionCard>
    );
};
