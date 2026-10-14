'use client';

import type { DigestReport } from '@/modules/entities/digest';
import { useDigestDataValue } from '../hooks/use-digest-data';
import { DigestDataProvider } from '../lib/digest-data.context';
import { DigestFeed } from '../digest-feed';
import { DigestPlans } from '../digest-plans';
import { DigestPresentations } from '../digest-presentations';
import { DigestRatingBoard } from '../digest-ratings';
import { DigestSummary } from '../digest-summary';
import { DigestTable } from '../digest-table';
import { DigestTimeline } from '../digest-timeline';

interface DigestBodyProps {
    report: DigestReport;
}

/** Тело дайджеста: один расчёт производных данных → блоки по порядку. */
export const DigestBody = ({ report }: DigestBodyProps) => {
    const value = useDigestDataValue(report);
    return (
        <DigestDataProvider value={value}>
            <div className="space-y-4">
                <DigestSummary />
                <DigestTimeline />
                <DigestTable />
                <DigestRatingBoard />
                <DigestPlans />
                <DigestPresentations />
                <DigestFeed />
            </div>
        </DigestDataProvider>
    );
};
