import type { RootState } from '@/modules/app/model/store';
import type { RQ_TYPE } from '@/modules/entities/bx-rq/model/types';
import {
    DEFAULT_CLIENT_TYPE,
    resolveClientType,
    type ResolvedClientType,
} from './get-deal-client-type.util';

/** Тип клиента из состояния: компания → сделка. */
export const selectResolvedClientType = (state: RootState): ResolvedClientType =>
    resolveClientType({
        portalCompany: state.portal.current?.company ?? undefined,
        company: state.app.bitrix.company,
        portalDeal: state.portal.current?.bitrixDeal ?? undefined,
        deal: state.app.bitrix.deal,
    });

/** Тип клиента или null, если не задан ни у компании, ни у сделки. */
export const selectClientType = (state: RootState): RQ_TYPE | null =>
    selectResolvedClientType(state).type;

/** Тип клиента для реквизитов и документов: не задан — организация. */
export const selectClientTypeOrDefault = (state: RootState): RQ_TYPE =>
    selectClientType(state) ?? DEFAULT_CLIENT_TYPE;
