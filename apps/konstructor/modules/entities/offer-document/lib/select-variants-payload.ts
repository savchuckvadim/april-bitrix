import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectVariantStageOf } from '../../complect-variant';
import { buildVariantsPayload, type VariantsPayload } from './build-variants-payload';

/**
 * Участники документов из состояния приложения: собранные варианты и
 * пропущенные с причиной. Блокеры, подпись кнопки и запросы читают один
 * результат; пересчёт идёт только при смене каталога, вариантов или
 * строк набора (слепки разбираются JSON.parse, на каждое действие стора это дорого).
 */
export const selectVariantsPayload = createSelector(
    [
        (state: RootState) => selectCatalog(state),
        (state: RootState) => state.complectVariant,
        (state: RootState) => state.rowSet.general,
        (state: RootState) => state.rowSet.alternative,
    ],
    (catalog, complectVariant, general, alternative): VariantsPayload =>
        buildVariantsPayload({
            catalog,
            records: complectVariant.records,
            items: complectVariant.items,
            stageOf: selectVariantStageOf({ complectVariant }),
            openVariantSmartId: complectVariant.openVariantSmartId,
            live: { general, alternative },
        }),
);
