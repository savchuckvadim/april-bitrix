'use client';
import { useDeepRouting } from "@/modules/processes";
import Link from "next/link";



export const PortalNavigation = () => {
    const {
        isPortal,
        isPortalList,
        isPortalDetail,
        isPortalGarant,
        isPortalBitrix,
        portalId,
        isPortalStatistics,
        isPortalEvent,
        isPortalKonstructor,
    } = useDeepRouting();


    if (!isPortal || isPortalList) {
        return null;
    }

    return (
        <div className="flex flex-row gap-2 py-0 text-sm">
            <Link href={`/portal/list`} className={(isPortalList || isPortalDetail) && !isPortalStatistics ? 'text-primary' : 'text-gray-500'}>{'List'}</Link>
            {portalId && <Link href={`/portal/${portalId}/garant`} className={isPortalGarant ? 'text-primary' : 'text-gray-500'}>{'Garant'}</Link>}
            {portalId && <Link href={`/portal/${portalId}/bitrix`} className={isPortalBitrix ? 'text-primary' : 'text-gray-500'}>{'Bitrix'}</Link>}

            {portalId && <Link href={`/portal/${portalId}/statistics`} className={isPortalStatistics ? 'text-primary' : 'text-gray-500'}>{'Statistics'}</Link>}

            {portalId && <Link href={`/portal/${portalId}/event`} className={isPortalEvent ? 'text-primary' : 'text-gray-500'}>{'Event'}</Link>}

            {portalId && <Link href={`/portal/${portalId}/konstructor`} className={isPortalKonstructor ? 'text-primary' : 'text-gray-500'}>{'Konstructor'}</Link>}

        </div>
    );
}
