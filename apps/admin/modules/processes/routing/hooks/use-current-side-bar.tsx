import { ALL_ENTITIES, aiKnowledgeEntities, clientEntities, garantEntities, konstructorEntities, marketplaceEntities, portalEntities, portalGarantEntities, portalKeysEntities, portalKonstructorEntities, portalPbxEntities, portalProviderEntities } from "../consts/routes.consts";
import { useDeepRouting } from "./use-routing.hook";


export const useCurrentSideBar = (): { currentNavItems: ALL_ENTITIES, baseUrl: string } => {
    const {
        isGarant,
        isPortal,
        isClient,
        isMarketplace,
        isPortalList,
        isPortalGarant,
        isPortalPbx,
        isPortalKeys,
        isPortalProvider,
        isPortalDetail,
        portalId,
        isKonstructor,
        isPortalKonstructor,
        isAiKnowledge

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
        } else if (isPortalPbx) {
            currentNavItems = portalPbxEntities;
            baseUrl = `/portal/${portalId}/pbx`;
        } else if (isPortalKeys) {
            currentNavItems = portalKeysEntities;
            baseUrl = `/portal/${portalId}`;
        } else if (isPortalProvider) {
            currentNavItems = portalProviderEntities;
            baseUrl = `/portal/${portalId}`;
        } else if (isPortalKonstructor) {
            currentNavItems = portalKonstructorEntities;
            baseUrl = `/portal/${portalId}/konstructor`;
        } else if (isPortalDetail) {
            currentNavItems = portalEntities;
            baseUrl = `/portal/${portalId}`;
        }

    } else if (isClient) {
        currentNavItems = clientEntities;
        baseUrl = '/client';
    } else if (isMarketplace) {
        // Маркетплейс: url элементов — полные пути (в разделе есть /client)
        currentNavItems = marketplaceEntities;
        baseUrl = '';
    }
    else if (isAiKnowledge) {
        // База знаний AI: url элементов — полные пути
        currentNavItems = aiKnowledgeEntities;
        baseUrl = '';
    }
    else if (isKonstructor || isPortalKonstructor) {
        currentNavItems = konstructorEntities;
        baseUrl = isKonstructor ? '/konstructor' : `/portal/${portalId}/konstructor`;
    }

    return { currentNavItems, baseUrl };
}
