import { RELATED_ENTITY_TYPE, type RelatedCrmDetails } from '../model';
import { isBaseSalesDeal } from './deal-category';
import { isOwnDeal } from './deal-ownership';
import type { EntityDescriptor } from './entity-descriptor';

/**
 * Куда увести менеджера, когда отправка не удалась.
 *
 * Оставлять его на экране с ошибкой бессмысленно: чинить надо в CRM, а не
 * здесь. Ведём туда, где видно всю картину по клиенту, — в порядке
 * убывания полезности:
 *
 *  1. Открытая СВОЯ сделка воронки «ОП Основная» — главная сделка работы
 *     (чужая открытая целью не становится — правило владения, как в шапке);
 *  2. сделка, из которой открылись, — если основной нет;
 *  3. сущность контекста встройки — компания, лид или та же сделка.
 */

export interface FinishTarget {
    entityType: EntityDescriptor['entityType'];
    entityId: number;
}

export interface FinishTargetInput {
    descriptor: EntityDescriptor | null;
    details: RelatedCrmDetails | null;
    /** Пользователь фрейма — гейт владения; не задан — правило выключено. */
    currentUserId?: number | null;
}

export const getFinishTarget = ({
    descriptor,
    details,
    currentUserId = null,
}: FinishTargetInput): FinishTarget | null => {
    if (!descriptor) return null;

    // Сделка плейсмента впереди найденной поиском — тот же приоритет, что у
    // бэка (init) и у шапки (relations-bar): при двух открытых основных
    // менеджера ведём в ту, которую реально двигал отчёт.
    const openBaseDeals =
        details?.deals?.filter(
            deal =>
                !deal.closed &&
                isBaseSalesDeal(deal) &&
                isOwnDeal(deal, currentUserId),
        ) ?? [];
    const baseDeal =
        openBaseDeals.find(deal => deal.id === descriptor.currentDealId) ??
        openBaseDeals[0];
    if (baseDeal) {
        return { entityType: RELATED_ENTITY_TYPE.DEAL, entityId: baseDeal.id };
    }

    if (descriptor.currentDealId) {
        return {
            entityType: RELATED_ENTITY_TYPE.DEAL,
            entityId: descriptor.currentDealId,
        };
    }

    return {
        entityType: descriptor.entityType,
        entityId: descriptor.entityId,
    };
};
