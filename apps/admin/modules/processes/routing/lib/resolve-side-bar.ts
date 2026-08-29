import {
    ALL_ENTITIES,
    aiKnowledgeEntities,
    clientEntities,
    garantEntities,
    konstructorEntities,
    marketplaceEntities,
    portalAiSettingsEntities,
    portalAppSettingsEntities,
    portalEntities,
    portalGarantEntities,
    portalKeysEntities,
    portalKonstructorEntities,
    portalPbxEntities,
    portalProviderEntities,
    portalQuestionnairesEntities,
} from '../consts/routes.consts';
import type { DeepRoute } from './resolve-deep-route';

/** Что рисует боковое меню: список пунктов и префикс их ссылок. */
export interface SideBarView {
    currentNavItems: ALL_ENTITIES;
    baseUrl: string;
}

/**
 * Пункты бокового меню по флагам маршрута.
 *
 * Чистая функция, а не тело хука: у раздела портала без своей ветки меню
 * молча уезжает в дефолт («Гарант» с baseUrl `/garant`) — ошибка не
 * падает, а выглядит как «сайдбар показывает чужие пункты». Проверяется
 * тестом рядом.
 */
export const resolveSideBar = (route: DeepRoute): SideBarView => {
    const {
        isGarant,
        isPortal,
        isClient,
        isMarketplace,
        isPortalList,
        isPortalGarant,
        isPortalPbx,
        isPortalKeys,
        isPortalAiSettings,
        isPortalAppSettings,
        isPortalQuestionnaires,
        isPortalProvider,
        isPortalDetail,
        portalId,
        isKonstructor,
        isPortalKonstructor,
        isAiKnowledge,
    } = route;

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
        } else if (isPortalAiSettings) {
            currentNavItems = portalAiSettingsEntities;
            baseUrl = `/portal/${portalId}`;
        } else if (isPortalAppSettings) {
            currentNavItems = portalAppSettingsEntities;
            baseUrl = `/portal/${portalId}`;
        } else if (isPortalQuestionnaires) {
            currentNavItems = portalQuestionnairesEntities;
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
    } else if (isAiKnowledge) {
        // База знаний AI: url элементов — полные пути
        currentNavItems = aiKnowledgeEntities;
        baseUrl = '';
    } else if (isKonstructor || isPortalKonstructor) {
        currentNavItems = konstructorEntities;
        baseUrl = isKonstructor
            ? '/konstructor'
            : `/portal/${portalId}/konstructor`;
    }

    return { currentNavItems, baseUrl };
};
