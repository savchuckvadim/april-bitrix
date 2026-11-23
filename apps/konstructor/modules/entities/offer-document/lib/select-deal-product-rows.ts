import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectComplectMode, selectVariantStagesLoading } from '../../complect-variant';
import { COMPLECT_MODE } from '../../complect-variant/model/dto';
import { buildDealProductRows, type DealProductRowsResult } from './build-deal-product-rows';
import { selectVariantsInput } from './select-variants-input';
import { skippedVariantsBlocker } from './skipped-variants-blocker';

/**
 * Товарные строки сделки из состояния приложения. Кэшируется: слепки вариантов
 * разбираются JSON.parse, на каждое действие стора это дорого. Пересчёт идёт
 * только при смене входа (selectVariantsInput) или режима сборки.
 */
export const selectDealProductRows = createSelector(
    [selectVariantsInput, (state: RootState) => selectComplectMode(state)],
    (input, mode): DealProductRowsResult => buildDealProductRows({ ...input, mode }),
);

/**
 * Почему сделку сейчас нельзя записать: подпись к ошибке отправки; null — можно.
 * Когда варианты продаются вместе, пока стадии грузятся, неизвестно, кто
 * участвует, а участник, которого собрать нельзя, блокирует запись тем же
 * текстом, что в документах.
 */
export const dealProductRowsBlocker = (state: RootState): string | null => {
    if (selectComplectMode(state) === COMPLECT_MODE.compare) return null;
    if (selectVariantStagesLoading(state)) {
        return 'Варианты ещё загружаются: повторите сохранение через несколько секунд';
    }
    return skippedVariantsBlocker(selectDealProductRows(state).skipped);
};
