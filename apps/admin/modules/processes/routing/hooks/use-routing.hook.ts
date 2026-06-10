'use client';
import { useParams, usePathname } from "next/navigation";


export const useDeepRouting = () => {
    const currentRoute = usePathname();
    const { portalId } = useParams<{ portalId: string }>();
    const isGarant = currentRoute.split('/')[1] === 'garant';
    const isPortal = currentRoute.split('/')[1] === 'portal';
    const isClient = currentRoute.split('/')[1] === 'client';
    const isDashboard = currentRoute.split('/')[1] === 'dashboard';
    const isStatistics = currentRoute.split('/')[1] === 'statistics';
    const isEvent = currentRoute.split('/')[1] === 'event';
    const isKonstructor = currentRoute.split('/')[1] === 'konstructor';
    const isPortalList = isPortal && currentRoute.split('/')[2] === 'list';


    const isPortalGarant = isPortal && currentRoute.split('/')[3] === 'garant';
    const isPortalBitrix = isPortal && currentRoute.split('/')[3] === 'bitrix';
    const isPortalStatistics = isPortal && currentRoute.split('/')[3] === 'statistics';
    const isPortalDetail = isPortal && portalId && !isPortalGarant && !isPortalBitrix;
    const isPortalEvent = isPortal && currentRoute.split('/')[3] === 'event';
    const isPortalKonstructor = isPortal && currentRoute.split('/')[3] === 'konstructor';



    const isStatisticsTranscription = isStatistics && currentRoute.split('/')[2] === 'transcription';
    const isStatisticsAi = isStatistics && currentRoute.split('/')[2] === 'ai';

    const isPortalStatisticsTranscription = isPortalStatistics && currentRoute.split('/')[4] === 'transcription';
    const isPortalStatisticsAi = isPortalStatistics && currentRoute.split('/')[4] === 'ai';

    return {
        isGarant,
        isPortal,
        isClient,
        isPortalList,
        isPortalGarant,
        isPortalBitrix,
        portalId,
        isPortalDetail,
        isDashboard,
        isStatistics,
        isPortalStatistics,
        isEvent,
        isKonstructor,
        isPortalEvent,
        isPortalKonstructor,
        isStatisticsTranscription,
        isStatisticsAi,
        isPortalStatisticsTranscription,
        isPortalStatisticsAi,
    };
}
