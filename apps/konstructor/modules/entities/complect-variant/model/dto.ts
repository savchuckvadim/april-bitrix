import type {
    ComplectCompositionDto,
    ComplectMode,
    ComplectOfferInfoblocks,
    ComplectOfferSettingsDto,
    InnerDealSnapshotDto,
} from '@workspace/nest-konstructor-api';
import {
    ComplectMode as ComplectModeValues,
    ComplectOfferInfoblocks as ComplectOfferInfoblocksValues,
} from '@workspace/nest-konstructor-api';

/**
 * Алиасы generated DTO (паттерн CLAUDE.md): слайс и UI знают только их —
 * переименование на бэке трогает этот файл и helper.
 */

/** Слепок варианта — та же строка bx_document_deals, но с variantSmartId. */
export type ComplectVariantRecordDto = InnerDealSnapshotDto;

/**
 * Настройки сборки комплекта. Хранятся у строки самой сделки и переезжают с
 * ней в отдел сервиса. Настройки есть только у КП: договор устроен жёстко
 * (на каждый комплект своё Приложение 1, одно Приложение 2 с ценами), счёт
 * следует за договором.
 *
 * Кто участвует, здесь НЕ хранится — участие это стадия элемента смарта.
 */
export type ComplectComposition = ComplectCompositionDto;
export type ComplectOfferSettings = ComplectOfferSettingsDto;
export type { ComplectMode, ComplectOfferInfoblocks };

export const COMPLECT_MODE = ComplectModeValues;
export const COMPLECT_OFFER_INFOBLOCKS = ComplectOfferInfoblocksValues;

export const DEFAULT_COMPLECT_COMPOSITION: ComplectComposition = {
    mode: COMPLECT_MODE.compare,
    offer: {
        infoblocks: COMPLECT_OFFER_INFOBLOCKS.independent,
        showAlternatives: false,
    },
    openVariantSmartId: null,
};

export const COMPLECT_MODE_TITLE: Record<ComplectMode, string> = {
    [COMPLECT_MODE.compare]: 'Для сравнения — клиент выбирает один',
    [COMPLECT_MODE.multi_contract]: 'Вместе, разными договорами',
    [COMPLECT_MODE.single_contract]: 'Вместе, одним договором',
};

export const COMPLECT_OFFER_INFOBLOCKS_TITLE: Record<
    ComplectOfferInfoblocks,
    string
> = {
    [COMPLECT_OFFER_INFOBLOCKS.independent]: 'У каждого набора своя страница',
    [COMPLECT_OFFER_INFOBLOCKS.merged]: 'Единым списком, повторы объединить',
};

/**
 * Один договор на несколько наборов возможен, только если тип договора у всех
 * одинаковый. Нечитаемый тип хотя бы у одного набора тоже запрещает
 * объединение — объединять вслепую нельзя, ошибка вскроется на подписании.
 */
export const isSingleContractAllowed = (
    contractTypeCodes: readonly string[],
): boolean => {
    if (!contractTypeCodes.length) return false;
    if (contractTypeCodes.some(code => !code)) return false;
    return new Set(contractTypeCodes).size === 1;
};
