'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getClinetTypeNameByCode,
    getRqFillPercent,
    getRqShowName,
} from '@/modules/entities/bx-rq';
import { missingRequisites } from '@/modules/entities/contract-document';
import { useClientType } from '@/modules/entities/deal';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Реквизиты клиента для договора: что выбрано, насколько заполнено, чего не
 * хватает. Тип клиента — из шапки (компания), затем сделка.
 */
export const useContractRequisites = () => {
    const nav = useKonstructorNavigation();
    const { clientType, resolved } = useClientType();
    const current = useAppSelector(state => state.bxrq.current.item);
    const isLoading = useAppSelector(state => state.bxrq.isLoading);
    const isSaved = Boolean(current && current.bx_id > 0);

    return {
        isLoading,
        clientTypeName: getClinetTypeNameByCode(clientType),
        isClientTypeSet: Boolean(clientType),
        isSaved,
        title: isSaved && current ? getRqShowName(current.fields, resolved) : null,
        fill: getRqFillPercent(current, resolved),
        missing: missingRequisites(clientType, isSaved ? current : null),
        toRequisites: () => nav.to(ROUTE_KONSTRUCTOR.REQUISITES),
    };
};
