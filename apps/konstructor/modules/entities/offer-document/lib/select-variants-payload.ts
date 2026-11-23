import { createSelector } from '@reduxjs/toolkit';
import { buildVariantsPayload, type VariantsPayload } from './build-variants-payload';
import { selectVariantsInput } from './select-variants-input';

/**
 * Участники КП из состояния приложения: собранные варианты и пропущенные с
 * причиной. Блокеры, подпись кнопки и запросы читают один результат; пересчёт
 * идёт только при смене входа (selectVariantsInput): слепки разбираются
 * JSON.parse, на каждое действие стора это дорого. В режиме «по одному»
 * участник один (открытый вариант) или ни одного, в режимах «вместе» все
 * незакрытые варианты.
 */
export const selectVariantsPayload = createSelector(
    [selectVariantsInput],
    (input): VariantsPayload => buildVariantsPayload(input),
);
