import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app';
import { selectCurrentRequisiteInn } from '@/modules/entities/client-inn/model/selectors';
import { resolveClientCard } from '../lib/resolve-client-card.util';

/**
 * Карточка клиента для шапки: пересчитывается только при смене входов. ИНН в
 * ней следует за текущим реквизитом: сменился реквизит, и шапка показывает
 * новый ИНН сразу.
 */
export const selectClientCard = createSelector(
    [
        (state: RootState) => state.app.domain,
        (state: RootState) => state.app.bitrix.company,
        (state: RootState) => state.app.bitrix.deal,
        (state: RootState) => state.app.dealId,
        (state: RootState) => state.portal.current?.company?.bitrixfields ?? null,
        selectCurrentRequisiteInn,
    ],
    (domain, company, deal, dealId, companyFields, requisiteInn) =>
        resolveClientCard({ domain, company, deal, dealId, companyFields, requisiteInn }),
);
