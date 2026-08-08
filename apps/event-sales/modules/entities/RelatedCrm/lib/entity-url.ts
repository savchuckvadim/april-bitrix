import { RELATED_ENTITY_TYPE, type RelatedEntityType } from '../model';

const ENTITY_PATH: Record<RelatedEntityType, string> = {
    [RELATED_ENTITY_TYPE.COMPANY]: 'company',
    [RELATED_ENTITY_TYPE.DEAL]: 'deal',
    [RELATED_ENTITY_TYPE.LEAD]: 'lead',
    [RELATED_ENTITY_TYPE.CONTACT]: 'contact',
};

/**
 * Прямая ссылка на карточку CRM-сущности портала — для target="_blank".
 *
 * Приложение живёт во фрейме-миниатюре, полноценная карточка клиента — в CRM;
 * ссылка в новую вкладку — единственный способ добраться до неё из встройки,
 * не теряя открытое приложение.
 */
export const getEntityCardUrl = (
    domain: string | null | undefined,
    entityType: RelatedEntityType,
    entityId: number,
): string | null => {
    if (!domain || !entityId) return null;
    return `https://${domain}/crm/${ENTITY_PATH[entityType]}/details/${entityId}/`;
};
