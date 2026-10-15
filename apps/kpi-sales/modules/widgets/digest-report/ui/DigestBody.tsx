'use client';

import type { DigestReport } from '@/modules/entities/digest';
import { useDigestDataValue } from '../hooks/use-digest-data';
import { useDigestTab } from '../hooks/use-digest-tab';
import { DigestDataProvider } from '../lib/digest-data.context';
import { DigestLayoutProvider } from '../lib/digest-layout.context';
import { DigestSummary } from '../digest-summary';
import { DigestTabsBar } from '../digest-tabs';
import { DigestWidgets } from './DigestWidgets';

interface DigestBodyProps {
    report: DigestReport;
}

/**
 * Тело дайджеста: итоги дня всегда сверху, под ними подвкладки — «Всё»
 * (все виджеты сворачиваемыми карточками) или один виджет.
 */
export const DigestBody = ({ report }: DigestBodyProps) => {
    const value = useDigestDataValue(report);
    const { tab, setTab } = useDigestTab();

    return (
        <DigestDataProvider value={value}>
            <DigestLayoutProvider
                value={{ mode: tab === 'all' ? 'all' : 'single', openTab: setTab }}
            >
                <div className="space-y-4">
                    <DigestSummary />
                    <DigestTabsBar tab={tab} onChange={setTab} />
                    <DigestWidgets tab={tab} />
                </div>
            </DigestLayoutProvider>
        </DigestDataProvider>
    );
};
