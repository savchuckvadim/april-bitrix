import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectComposition, selectVariantStageOf, selectVariantStagesLoading } from '../../complect-variant';
import { COMPLECT_MODE } from '../../complect-variant/model/dto';
import { buildDealProductRows, type DealProductRowsResult } from './build-deal-product-rows';
import { skippedVariantsBlocker } from './skipped-variants-blocker';

/**
 * Товарные строки сделки из состояния приложения. Кэшируется: слепки вариантов
 * разбираются JSON.parse, на каждое действие стора это дорого. Пересчёт идёт
 * только при смене каталога, вариантов, настроек сборки или строк набора.
 */
export const selectDealProductRows = createSelector(
    [
        (state: RootState) => selectCatalog(state),
        (state: RootState) => state.complectVariant,
        (state: RootState) => state.rowSet.general,
        (state: RootState) => state.rowSet.alternative,
    ],
    (catalog, complectVariant, general, alternative): DealProductRowsResult =>
        buildDealProductRows({
            catalog,
            mode: selectComposition({ complectVariant }).mode,
            records: complectVariant.records,
            items: complectVariant.items,
            stageOf: selectVariantStageOf({ complectVariant }),
            openVariantSmartId: complectVariant.openVariantSmartId,
            live: { general, alternative },
        }),
);

/**
 * Почему сделку сейчас нельзя записать: подпись к ошибке отправки; null — можно.
 * Когда варианты продаются вместе, пока стадии грузятся, неизвестно, кто
 * участвует, а участник, которого собрать нельзя, блокирует запись тем же
 * текстом, что в документах.
 */
export const dealProductRowsBlocker = (state: RootState): string | null => {
    if (selectComposition(state).mode === COMPLECT_MODE.compare) return null;
    if (selectVariantStagesLoading(state)) {
        return 'Варианты ещё загружаются: повторите сохранение через несколько секунд';
    }
    return skippedVariantsBlocker(selectDealProductRows(state).skipped);
};
