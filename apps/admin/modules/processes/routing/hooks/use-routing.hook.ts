'use client';
import { useParams, usePathname } from "next/navigation";


export const useDeepRouting = () => {
    const currentRoute = usePathname();
    const { portalId } = useParams<{ portalId: string }>();
    const isGarant = currentRoute.split('/')[1] === 'garant';
    const isPortal = currentRoute.split('/')[1] === 'portal';
    const isClient = currentRoute.split('/')[1] === 'client';
    const isMarketplace = currentRoute.split('/')[1] === 'marketplace';
    const isDashboard = currentRoute.split('/')[1] === 'dashboard';
    const isStatistics = currentRoute.split('/')[1] === 'statistics';
    const isEvent = currentRoute.split('/')[1] === 'event';
    const isKonstructor = currentRoute.split('/')[1] === 'konstructor';
    const isPortalList = isPortal && currentRoute.split('/')[2] === 'list';


    const isPortalGarant = isPortal && currentRoute.split('/')[3] === 'garant';
    const isPortalPbx = isPortal && currentRoute.split('/')[3] === 'pbx';
    const isPortalKeys = isPortal && currentRoute.split('/')[3] === 'keys';
    const isPortalProvider = isPortal && currentRoute.split('/')[3] === 'provider';
    const isPortalStatistics = isPortal && currentRoute.split('/')[3] === 'statistics';
    const isPortalKonstructor = isPortal && currentRoute.split('/')[3] === 'konstructor';
    const isPortalDetail = isPortal && portalId && !isPortalGarant && !isPortalPbx && !isPortalKeys && !isPortalProvider && !isPortalKonstructor;
    const isPortalEvent = isPortal && currentRoute.split('/')[3] === 'event';



    const isStatisticsTranscription = isStatistics && currentRoute.split('/')[2] === 'transcription';
    const isStatisticsAi = isStatistics && currentRoute.split('/')[2] === 'ai';

    const isPortalStatisticsTranscription = isPortalStatistics && currentRoute.split('/')[4] === 'transcription';
    const isPortalStatisticsAi = isPortalStatistics && currentRoute.split('/')[4] === 'ai';

    return {
        isGarant,
        isPortal,
        isClient,
        isMarketplace,
        isPortalList,
        isPortalGarant,
        isPortalPbx,
        isPortalKeys,
        isPortalProvider,
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
