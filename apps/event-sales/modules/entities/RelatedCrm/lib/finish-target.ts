import { RELATED_ENTITY_TYPE, type RelatedCrmDetails } from '../model';
import type { EntityDescriptor } from './entity-descriptor';

/**
 * Куда увести менеджера, когда отправка не удалась.
 *
 * Оставлять его на экране с ошибкой бессмысленно: чинить надо в CRM, а не
 * здесь. Ведём туда, где видно всю картину по клиенту, — в порядке
 * убывания полезности:
 *
 *  1. Открытая сделка воронки «ОП Основная» — главная сделка работы;
 *  2. сделка, из которой открылись, — если основной нет;
 *  3. сущность контекста встройки — компания, лид или та же сделка.
 */

/** Код воронки «ОП Основная» в слепке портала. */
const BASE_SALES_CATEGORY_CODE = 'sales_base';

export interface FinishTarget {
    entityType: EntityDescriptor['entityType'];
    entityId: number;
}

export interface FinishTargetInput {
    descriptor: EntityDescriptor | null;
    details: RelatedCrmDetails | null;
}

export const getFinishTarget = ({
    descriptor,
    details,
}: FinishTargetInput): FinishTarget | null => {
    if (!descriptor) return null;

    const baseDeal = details?.deals?.find(
        deal =>
            !deal.closed &&
            deal.stage?.categoryCode === BASE_SALES_CATEGORY_CODE,
    );
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
