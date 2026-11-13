'use client';
import { useDeepRouting } from "@/modules/processes";
import Link from "next/link";

interface StatisticsTab {
    href: string;
    label: string;
    active: boolean;
}

/** Вкладки статистики: общие или одного портала. */
export const StatisticsNavigation = () => {
    const {
        isStatistics,
        isPortalStatistics,
        isStatisticsTranscription,
        isStatisticsAi,
        isStatisticsTranscriptionSpend,
        isPortalStatisticsTranscription,
        isPortalStatisticsAi,
        isPortalStatisticsTranscriptionSpend,
        portalId,
    } = useDeepRouting();

    if (!isStatistics && !isPortalStatistics) {
        return null;
    }

    const base = portalId ? `/portal/${portalId}/statistics` : '/statistics';
    const tabs: StatisticsTab[] = [
        {
            href: `${base}/transcription`,
            label: 'Транскрипции',
            active: portalId ? isPortalStatisticsTranscription : isStatisticsTranscription,
        },
        {
            href: `${base}/ai`,
            label: 'AI-записи',
            active: portalId ? isPortalStatisticsAi : isStatisticsAi,
        },
        {
            href: `${base}/transcription-spend`,
            label: 'Расход на распознавание',
            active: portalId
                ? isPortalStatisticsTranscriptionSpend
                : isStatisticsTranscriptionSpend,
        },
    ];

    return (
        <div className="flex flex-row gap-4 px-0 py-0 text-sm bg-background/80 backdrop-blur-sm">
            {tabs.map(tab => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={tab.active ? 'text-primary' : 'text-gray-500'}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
};
