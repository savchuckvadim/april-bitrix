import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectComposition, selectVariantStageOf, selectVariantStagesLoading } from '../../complect-variant';
import { COMPLECT_MODE } from '../../complect-variant/model/dto';
import { skippedVariantsBlocker } from '../../offer-document/lib/skipped-variants-blocker';
import { contractRequestBlocker } from './build-contract-request';
import { buildContractUnits, type ContractUnitsResult } from './contract-units';

/**
 * Единицы договора из состояния приложения. Кэшируется: слепки вариантов
 * разбираются JSON.parse, на каждое действие стора это дорого. Пересчёт идёт
 * только при смене каталога, вариантов, настроек сборки или строк набора.
 */
export const selectContractUnits = createSelector(
    [
        (state: RootState) => selectCatalog(state),
        (state: RootState) => state.complectVariant,
        (state: RootState) => state.rowSet.general,
        (state: RootState) => state.rowSet.alternative,
    ],
    (catalog, complectVariant, general, alternative): ContractUnitsResult =>
        buildContractUnits({
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
 * Почему договор (или договоры вариантов) сейчас не собрать — подпись к
 * заблокированной кнопке; null — можно. К блокеру живого договора добавляются
 * проверки вариантов, когда они продаются вместе: пока стадии грузятся,
 * неизвестно, кто участвует, а участник, которого собрать нельзя, блокирует
 * формирование тем же текстом, что в КП.
 */
export const contractGenerateBlocker = (state: RootState): string | null => {
    const base = contractRequestBlocker(state);
    if (base) return base;
    if (selectComposition(state).mode === COMPLECT_MODE.compare) return null;
    if (selectVariantStagesLoading(state)) return 'Варианты ещё загружаются';
    return skippedVariantsBlocker(selectContractUnits(state).skipped);
};
