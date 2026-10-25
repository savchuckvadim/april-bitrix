import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app';
import { resolveClientCard } from '../lib/resolve-client-card.util';

/** Карточка клиента для шапки: пересчитывается только при смене входов. */
export const selectClientCard = createSelector(
    [
        (state: RootState) => state.app.domain,
        (state: RootState) => state.app.bitrix.company,
        (state: RootState) => state.app.bitrix.deal,
        (state: RootState) => state.app.dealId,
        (state: RootState) => state.portal.current?.company?.bitrixfields ?? null,
    ],
    (domain, company, deal, dealId, companyFields) =>
        resolveClientCard({ domain, company, deal, dealId, companyFields }),
);
