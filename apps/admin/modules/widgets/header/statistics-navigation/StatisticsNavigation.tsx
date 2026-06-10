'use client';
import { useDeepRouting } from "@/modules/processes";
import Link from "next/link";



export const StatisticsNavigation = () => {
    const {
        isStatistics,
        isPortalStatistics,
        isStatisticsTranscription,
        isStatisticsAi,
        isPortalStatisticsTranscription,
        isPortalStatisticsAi,
        portalId,

    } = useDeepRouting();


    if (!isStatistics && !isPortalStatistics) {
        return null;
    }

    return (
        <div className="flex flex-row gap-2 px-0 py-0 text-sm bg-background/80 backdrop-blur-sm">

            {!portalId &&<Link href={`/statistics/transcription`} className={isStatisticsTranscription ? 'text-primary' : 'text-gray-500'}>{'Transcription'}</Link>}
            {!portalId &&<Link href={`/statistics/ai`} className={isStatisticsAi ? 'text-primary' : 'text-gray-500'}>{'AI'}</Link>}
            {portalId && <Link href={`/portal/${portalId}/statistics/transcription`} className={isPortalStatisticsTranscription ? 'text-primary' : 'text-gray-500'}>{'Transcription'}</Link>}
            {portalId && <Link href={`/portal/${portalId}/statistics/ai`} className={isPortalStatisticsAi ? 'text-primary' : 'text-gray-500'}>{'AI'}</Link>}


        </div>
    );
}
