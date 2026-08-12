import { RELATED_ENTITY_TYPE, type RelatedEntityType } from '../model';
import { getCrmUrl, type CrmEntityKind } from '@/modules/app/lib/utills/url';

const ENTITY_KIND: Record<RelatedEntityType, CrmEntityKind> = {
    [RELATED_ENTITY_TYPE.COMPANY]: 'company',
    [RELATED_ENTITY_TYPE.DEAL]: 'deal',
    [RELATED_ENTITY_TYPE.LEAD]: 'lead',
    [RELATED_ENTITY_TYPE.CONTACT]: 'contact',
};

/**
 * Прямая ссылка на карточку CRM-сущности портала — для target="_blank".
 *
 * Сборка URL — в общей утилите (app/lib/utills/url): она одна проверяет
 * домен и не даёт ссылке уехать на текущий хост, где стоит чужое приложение.
 */
export const getEntityCardUrl = (
    domain: string | null | undefined,
    entityType: RelatedEntityType,
    entityId: number,
): string | null => getCrmUrl(domain, ENTITY_KIND[entityType], entityId);
