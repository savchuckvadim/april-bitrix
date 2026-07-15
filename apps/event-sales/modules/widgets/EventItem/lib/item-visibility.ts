import { DomainFeatureConfig } from '@/modules/app/consts/domain-config';
import { WorkStatusCode } from '@/modules/entities/EventReport/type/event-report-type';
import { EventItemResultType } from '../model/EventItemSlice';

export interface ItemVisibilityInput {
    menuType: EventItemResultType | null;
    workStatusCode: WorkStatusCode;
    config: DomainFeatureConfig;
    departmentMode: 'sales' | 'tmc';
    isLeadContext: boolean;
}

export interface ItemVisibility {
    presentation: boolean;
    noresult: boolean;
    plan: boolean;
    sale: boolean;
    postFail: boolean;
}

/**
 * ЕДИНСТВЕННОЕ место правил видимости секций EventItem
 * (замена размазанных условий legacy SalesMenu):
 * - презентация — только sales-режим, не лид, при «результативном»/новом событии;
 * - причина недозвона — не лид, когда событие НЕ результативное/новое;
 * - план — пока статус работы не финальный (не Продажа/Отказ);
 * - продажа — при статусе «Продажа», не лид;
 * - дата пост-отказа — при «Отказе» на доменах с withPostFail, не лид.
 */
export const getItemVisibility = ({
    menuType,
    workStatusCode,
    config,
    departmentMode,
    isLeadContext,
}: ItemVisibilityInput): ItemVisibility => {
    const isTmc = departmentMode === 'tmc';
    const isResultLike =
        menuType === EventItemResultType.RESULT ||
        menuType === EventItemResultType.NEW;
    const withPlan = workStatusCode !== 'fail' && workStatusCode !== 'success';

    return {
        presentation: !isTmc && !isLeadContext && isResultLike,
        noresult: !isLeadContext && !isResultLike,
        plan: withPlan,
        sale: workStatusCode === 'success' && !isLeadContext,
        postFail:
            config.withPostFail && workStatusCode === 'fail' && !isLeadContext,
    };
};
