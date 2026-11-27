import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectModeVariantParticipants, selectOfferVariantParticipants } from '../../complect-variant';
import type { VariantsPayloadInput } from './build-variants-payload';

/** Собирает вход из частей состояния: участники приходят снаружи, остальное у входов общее. */
const toVariantsInput = (
    catalog: VariantsPayloadInput['catalog'],
    participants: VariantsPayloadInput['participants'],
    items: VariantsPayloadInput['items'],
    openVariantSmartId: number | null,
    general: VariantsPayloadInput['live']['general'],
    alternative: VariantsPayloadInput['live']['alternative'],
    serviceDepartment: boolean,
): VariantsPayloadInput => ({
    catalog,
    participants,
    items,
    openVariantSmartId,
    live: { general, alternative },
    serviceDepartment,
});

/** Сервисный отдел из контекста набора: от него зависит, какие пакеты LT собраны. */
const selectServiceDepartment = (state: RootState): boolean => Boolean(state.rowSet.context.serviceDepartment);

/**
 * Вход сборки участников КП (Word, PDF, оба превью) из состояния приложения.
 * КП делают по одному варианту: участник открытый незакрытый вариант при любом
 * режиме сделки, смена режима вход не пересчитывает. Пересчёт идёт при смене
 * каталога, участника, названий, открытого варианта или строк набора.
 */
export const selectOfferVariantsInput = createSelector(
    [
        (state: RootState) => selectCatalog(state),
        (state: RootState) => selectOfferVariantParticipants(state),
        (state: RootState) => state.complectVariant.items,
        (state: RootState) => state.complectVariant.openVariantSmartId,
        (state: RootState) => state.rowSet.general,
        (state: RootState) => state.rowSet.alternative,
        selectServiceDepartment,
    ],
    toVariantsInput,
);

/**
 * Вход сборки участников документов, которые идут по режиму сделки
 * (composition.mode): договор, отчёт о поставке, заявка поставки и товары
 * сделки. Режим «только открытый вариант» даёт один участник, режимы «все
 * варианты» дают все незакрытые. Пересчёт идёт при смене каталога, участников,
 * названий, открытого варианта или строк набора.
 */
export const selectModeVariantsInput = createSelector(
    [
        (state: RootState) => selectCatalog(state),
        (state: RootState) => selectModeVariantParticipants(state),
        (state: RootState) => state.complectVariant.items,
        (state: RootState) => state.complectVariant.openVariantSmartId,
        (state: RootState) => state.rowSet.general,
        (state: RootState) => state.rowSet.alternative,
        selectServiceDepartment,
    ],
    toVariantsInput,
);
