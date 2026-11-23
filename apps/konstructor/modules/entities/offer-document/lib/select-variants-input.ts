import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectVariantParticipants } from '../../complect-variant';
import type { VariantsPayloadInput } from './build-variants-payload';

/**
 * Вход сборки участников документов из состояния приложения. Единственное
 * место, где участники (selectVariantParticipants: режим сделки, открытый
 * вариант, закрытые стадии) сходятся с каталогом и живым набором строк: КП,
 * PDF, договор, товары сделки и заявка поставки читают один и тот же вход, и
 * ни один не собирает аргументы по-своему. Результат кэшируется: пересчёт идёт
 * при смене каталога, участников, названий, открытого варианта или строк набора.
 */
export const selectVariantsInput = createSelector(
    [
        (state: RootState) => selectCatalog(state),
        (state: RootState) => selectVariantParticipants(state),
        (state: RootState) => state.complectVariant.items,
        (state: RootState) => state.complectVariant.openVariantSmartId,
        (state: RootState) => state.rowSet.general,
        (state: RootState) => state.rowSet.alternative,
    ],
    (catalog, participants, items, openVariantSmartId, general, alternative): VariantsPayloadInput => ({
        catalog,
        participants,
        items,
        openVariantSmartId,
        live: { general, alternative },
    }),
);
