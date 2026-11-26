import { salesFlowFields } from '@/modules/app/lib/sales-flow.util';
import type { RootState } from '@/modules/app/model/store';
import type { OfferSalesFlowFields } from '../model/types';
import { presentationRequestFields } from './presentation-choice.util';

/**
 * Поля потока продаж запроса КП (Word и PDF): `salesFlow` по отделу и
 * `presentation` с выбранной презентацией. Только запрос формирования получает
 * их: у превью их нет, и ключ превью от них не меняется.
 */
export const selectOfferSalesFlowFields = (state: RootState): OfferSalesFlowFields => ({
    ...salesFlowFields(state.app.department),
    ...presentationRequestFields(state.offerDocument.presentation),
});
