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
 * ней в отдел сервиса. Режим решает, какие варианты идут в договор, отчёт о
 * поставке, заявку на поставку и товары сделки: один открытый (`compare`) или
 * все незакрытые вместе (`multi_contract`, `single_contract`). КП режим не
 * читает: оно всегда делается по открытому варианту. Настройки печати есть
 * только у КП: договор устроен жёстко (на каждый комплект своё Приложение 1,
 * одно Приложение 2 с ценами), счёт следует за договором.
 *
 * Кто участвует, здесь не хранится: его определяют режим, открытый вариант и
 * закрытые стадии элементов смарта (selectParticipants).
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

/**
 * Значения режима на бэке прежние (`compare` и два `*_contract`), меняется
 * смысл. `compare`: в договор и отчёт идёт открытый вариант. `multi_contract`
 * и `single_contract`: идут все варианты, кроме отклонённых и закрытых.
 * Подписи те же, что на экранах договора и отчёта о поставке.
 */
export const COMPLECT_MODE_TITLE: Record<ComplectMode, string> = {
    [COMPLECT_MODE.compare]: 'Только открытый вариант',
    [COMPLECT_MODE.single_contract]: 'Все варианты одним договором',
    [COMPLECT_MODE.multi_contract]: 'Все варианты, каждому свой договор',
};

/** Порядок пунктов выбора режима на экране. */
export const COMPLECT_MODE_ORDER: readonly ComplectMode[] = [
    COMPLECT_MODE.compare,
    COMPLECT_MODE.single_contract,
    COMPLECT_MODE.multi_contract,
];

const TOGETHER_MODE_NOTE =
    'В договор, отчёт о поставке и товары сделки идут все варианты, кроме отклонённых и закрытых.';

/** Строка под выбором режима: что именно идёт в договор и отчёт. */
export const COMPLECT_MODE_NOTE: Record<ComplectMode, string> = {
    [COMPLECT_MODE.compare]:
        'В договор, отчёт о поставке и товары сделки идёт вариант, который сейчас редактируется.',
    [COMPLECT_MODE.single_contract]: TOGETHER_MODE_NOTE,
    [COMPLECT_MODE.multi_contract]: TOGETHER_MODE_NOTE,
};

/**
 * Параметры и ответ `DELETE /api/konstructor/deal/variant`. Ручка готова на
 * бэке, но в orval её ещё нет (`pnpm run generate` в `@workspace/nest-konstructor-api`
 * не прогнан), поэтому формы описаны здесь руками, а запрос идёт через тот же
 * транспорт `customAxios`. После генерации достаточно заменить эти два типа
 * сгенерированными и вызов в helper.
 */
export interface ComplectVariantDeleteParams {
    domain: string;
    dealId: number;
    variantSmartId: number;
}

export interface ComplectVariantDeleteResponse {
    /** false — строки варианта в базе уже не было; для вызывающего это не сбой. */
    deleted: boolean;
}

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
