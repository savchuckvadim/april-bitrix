import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { buildClientTypeView } from './client-type-view';

type Row = Record<string, unknown> | null;

/** Вид «Типа клиента» для шапки и выравнивания при открытии. */
export const selectClientTypeView = createSelector(
    [
        (state: RootState) => state.portal.portal,
        (state: RootState) => state.app.bitrix.deal,
        (state: RootState) => state.app.bitrix.company,
        (state: RootState) => state.clientType.saved,
    ],
    (portal, deal, company, saved) =>
        buildClientTypeView({
            dealFields: portal?.bitrixDeal?.bitrixfields,
            companyFields: portal?.company?.bitrixfields,
            deal: (deal ?? null) as unknown as Row,
            company: (company ?? null) as unknown as Row,
            saved,
        }),
);
