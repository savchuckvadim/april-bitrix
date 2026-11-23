import { createSelector } from '@reduxjs/toolkit';
import { buildVariantsPayload, type VariantsPayload } from './build-variants-payload';
import { selectModeVariantsInput, selectOfferVariantsInput } from './select-variants-input';

/**
 * Участники КП из состояния приложения: собранные варианты и пропущенные с
 * причиной. Блокеры, подпись кнопки и запросы читают один результат; пересчёт
 * идёт только при смене входа (selectOfferVariantsInput): слепки разбираются
 * JSON.parse, на каждое действие стора это дорого. Участник один (открытый
 * вариант) или ни одного, режим сделки на него не влияет.
 */
export const selectOfferVariantsPayload = createSelector(
    [selectOfferVariantsInput],
    (input): VariantsPayload => buildVariantsPayload(input),
);

/**
 * Участники отчёта о поставке и заявки поставки: те же варианты, что идут в
 * договор и товары сделки, по режиму сделки (selectModeVariantsInput).
 */
export const selectModeVariantsPayload = createSelector(
    [selectModeVariantsInput],
    (input): VariantsPayload => buildVariantsPayload(input),
);
