'use client';
import { usePortal } from "@/modules/entities/portal";
import { useDeepRouting } from "@/modules/processes";
import Link from "next/link";



export const PortalNavigation = () => {
    const {
        isPortal,
        isPortalList,
        isPortalDetail,
        isPortalGarant,
        isPortalBitrix,
        isPortalPbx,
        isPortalKeys,
        isPortalProvider,
        portalId,
        isPortalStatistics,
        isPortalEvent,
        isPortalKonstructor,
    } = useDeepRouting();
    const { data: currentPortal } = usePortal(Number(portalId))

    if (!isPortal || isPortalList) {
        return null;
    }

    return (
        <div className="flex flex-row justify-between gap-2">
            <div className="flex flex-row gap-2 py-0 text-sm">
                <Link href={`/portal/list`} className={(isPortalList || isPortalDetail) && !isPortalStatistics ? 'text-primary' : 'text-gray-500'}>{'List'}</Link>
                {portalId && <Link href={`/portal/${portalId}/garant`} className={isPortalGarant ? 'text-primary' : 'text-gray-500'}>{'Garant'}</Link>}
                {portalId && <Link href={`/portal/${portalId}/bitrix`} className={isPortalBitrix ? 'text-primary' : 'text-gray-500'}>{'Bitrix'}</Link>}

                {portalId && <Link href={`/portal/${portalId}/pbx`} className={isPortalPbx ? 'text-primary' : 'text-gray-500'}>{'PBX'}</Link>}

                {portalId && <Link href={`/portal/${portalId}/keys`} className={isPortalKeys ? 'text-primary' : 'text-gray-500'}>{'Keys'}</Link>}

                {portalId && <Link href={`/portal/${portalId}/provider`} className={isPortalProvider ? 'text-primary' : 'text-gray-500'}>{'Provider'}</Link>}

                {portalId && <Link href={`/portal/${portalId}/statistics`} className={isPortalStatistics ? 'text-primary' : 'text-gray-500'}>{'Statistics'}</Link>}

                {portalId && <Link href={`/portal/${portalId}/event`} className={isPortalEvent ? 'text-primary' : 'text-gray-500'}>{'Event'}</Link>}

                {portalId && <Link href={`/portal/${portalId}/konstructor`} className={isPortalKonstructor ? 'text-primary' : 'text-gray-500'}>{'Konstructor'}</Link>}

            </div>
            <div className="text-sm pr-10">
                {currentPortal && <p>{currentPortal.domain}</p>}
            </div>
        </div>

    );
}
