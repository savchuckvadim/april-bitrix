import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectComplectMode, selectVariantStagesLoading } from '../../complect-variant';
import { COMPLECT_MODE } from '../../complect-variant/model/dto';
import { selectModeVariantsInput } from '../../offer-document/lib/select-variants-input';
import { skippedVariantsBlocker } from '../../offer-document/lib/skipped-variants-blocker';
import { contractRequestBlocker } from './build-contract-request';
import { buildContractUnits, type ContractUnitsResult } from './contract-units';

/**
 * Единицы договора из состояния приложения. Кэшируется: слепки вариантов
 * разбираются JSON.parse, на каждое действие стора это дорого. Пересчёт идёт
 * только при смене входа (selectModeVariantsInput: каталог, участники по
 * режиму сделки, открытый вариант, строки набора) или режима сборки.
 */
export const selectContractUnits = createSelector(
    [selectModeVariantsInput, (state: RootState) => selectComplectMode(state)],
    (input, mode): ContractUnitsResult => buildContractUnits({ ...input, mode }),
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
    if (selectComplectMode(state) === COMPLECT_MODE.compare) return null;
    if (selectVariantStagesLoading(state)) return 'Варианты ещё загружаются';
    return skippedVariantsBlocker(selectContractUnits(state).skipped);
};
