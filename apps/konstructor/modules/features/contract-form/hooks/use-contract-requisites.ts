'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getClinetTypeNameByCode,
    getRqFillPercent,
    getRqShowName,
    RQ_TYPE,
} from '@/modules/entities/bx-rq';
import { missingRequisites } from '@/modules/entities/contract-document';
import { useClientType } from '@/modules/entities/deal';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';

/** Реквизиты клиента для договора: что выбрано, насколько заполнено, чего не хватает. */
export const useContractRequisites = () => {
    const nav = useKonstructorNavigation();
    const { clientType } = useClientType();
    const current = useAppSelector(state => state.bxrq.current.item);
    const isLoading = useAppSelector(state => state.bxrq.isLoading);
    const type = clientType ?? RQ_TYPE.ORGANIZATION;

    return {
        isLoading,
        clientTypeName: getClinetTypeNameByCode(clientType),
        title: current ? getRqShowName(current.fields, type) : null,
        fill: getRqFillPercent(current, type),
        missing: missingRequisites(clientType, current),
        toRequisites: () => nav.to(ROUTE_KONSTRUCTOR.REQUISITES),
    };
};
