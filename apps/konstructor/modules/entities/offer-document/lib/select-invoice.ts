import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { buildRequestInvoice, hasComparisonSets, isInvoiceRequested } from './invoice-request.util';

/** В КП есть наборы для сравнения (непустые): от этого зависит вопрос о счетах на все товары. */
export const selectHasComparisonSets = (state: RootState): boolean => hasComparisonSets(state.rowSet.alternative);

/** Счёт так, как он уходит в запрос КП (Word и PDF). */
export const selectOfferRequestInvoice = createSelector(
    [(state: RootState) => state.offerDocument.invoice, selectHasComparisonSets],
    (invoice, withComparisonSets) => buildRequestInvoice(invoice, withComparisonSets),
);

/** Просят ли хоть один счёт: от этого зависит, показывать ли дату и номер. */
export const selectInvoiceRequested = (state: RootState): boolean =>
    isInvoiceRequested(selectOfferRequestInvoice(state));
