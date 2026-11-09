/**
 * Реестр сервисов раздела: порядок здесь — порядок в меню, на главной
 * раздела и в подвале.
 */

import type { PlatformService, PlatformServiceSlug } from '../types';
import { AI_SERVICE } from './ai';
import { AUTOMATION_SERVICE } from './automation';
import { CALLS_SERVICE } from './calls';
import { DOCUMENTS_SERVICE } from './documents';
import { FUNNELS_SERVICE } from './funnels';
import { KPI_SERVICE } from './kpi';
import { LEADS_SERVICE } from './leads';
import { SITE_SERVICE } from './site';

export const PLATFORM_SERVICES: readonly PlatformService[] = [
    CALLS_SERVICE,
    DOCUMENTS_SERVICE,
    KPI_SERVICE,
    AI_SERVICE,
    LEADS_SERVICE,
    FUNNELS_SERVICE,
    AUTOMATION_SERVICE,
    SITE_SERVICE,
];

/** Сервис по адресу страницы; неизвестный адрес — undefined (страница 404). */
export const findPlatformService = (slug: string): PlatformService | undefined =>
    PLATFORM_SERVICES.find(service => service.slug === slug);

/** Сервисы по списку адресов в том же порядке; неизвестные пропускаются. */
export const getPlatformServices = (
    slugs: readonly PlatformServiceSlug[],
): PlatformService[] =>
    slugs.flatMap(slug => {
        const service = findPlatformService(slug);
        return service ? [service] : [];
    });
