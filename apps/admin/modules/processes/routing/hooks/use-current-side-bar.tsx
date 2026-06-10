import { ALL_ENTITIES, clientEntities, garantEntities, konstructorEntities, portalBitrixEntities, portalEntities, portalGarantEntities } from "../consts/routes.consts";
import { useDeepRouting } from "./use-routing.hook";


export const useCurrentSideBar = (): { currentNavItems: ALL_ENTITIES, baseUrl: string } => {
    const {
        isGarant,
        isPortal,
        isClient,
        isPortalList,
        isPortalGarant,
        isPortalBitrix,
        isPortalDetail,
        portalId,
        isKonstructor,
        isPortalKonstructor

    } = useDeepRouting();
    let currentNavItems: ALL_ENTITIES = garantEntities;
    let baseUrl = '/garant';
    if (isGarant) {
        currentNavItems = garantEntities;
    } else if (isPortal) {
        currentNavItems = portalEntities;
        baseUrl = '/portal';
        if (isPortalList) {
            currentNavItems = portalEntities;
            baseUrl = '/portal/list';
        } else if (isPortalGarant) {
            currentNavItems = portalGarantEntities;
            baseUrl = `/portal/${portalId}/garant`;
        } else if (isPortalBitrix) {
            currentNavItems = portalBitrixEntities;
            baseUrl = `/portal/${portalId}/bitrix`;
        } else if (isPortalDetail) {
            currentNavItems = portalEntities;
            baseUrl = `/portal/${portalId}`;
        }

    } else if (isClient) {
        currentNavItems = clientEntities;
        baseUrl = '/client';
    }
    else if (isKonstructor || isPortalKonstructor) {
        currentNavItems = konstructorEntities;
        baseUrl = isKonstructor ? '/konstructor' : `/portal/${portalId}/konstructor`;
    }

    return { currentNavItems, baseUrl };
}
