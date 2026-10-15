'use client';

import type { DigestTabKey } from '../lib/digest-tabs';
import { DigestFeed } from '../digest-feed';
import { DigestPlans } from '../digest-plans';
import { DigestPresentations } from '../digest-presentations';
import { DigestRatingBoard } from '../digest-ratings';
import { DigestSales } from '../digest-sales';
import { DigestTable } from '../digest-table';
import { DigestTimeline } from '../digest-timeline';

interface DigestWidgetsProps {
    tab: DigestTabKey;
}

/** Виджеты подвкладки: «Всё» — все по порядку, иначе один. */
export const DigestWidgets = ({ tab }: DigestWidgetsProps) => {
    const show = (key: DigestTabKey) => tab === 'all' || tab === key;
    return (
        <div className="space-y-4">
            {show('hours') && <DigestTimeline />}
            {show('employees') && <DigestTable />}
            {show('rating') && <DigestRatingBoard />}
            {show('plan') && <DigestPlans />}
            {show('presentations') && <DigestPresentations />}
            {show('sales') && <DigestSales />}
            {show('feed') && <DigestFeed />}
        </div>
    );
};
