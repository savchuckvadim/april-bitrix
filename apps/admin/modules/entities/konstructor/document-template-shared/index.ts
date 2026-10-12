/**
 * СОВМЕСТИМОСТНЫЙ СЛОЙ. Своих значений здесь нет.
 *
 * Русские подписи словарей шаблонов документов (тип договора, тип клиента,
 * тип поставки, уровень привязки) живут в ЕДИНСТВЕННОМ месте:
 *   `modules/entities/konstructor/lib/consts/template-criteria.consts.ts`
 * (баррель — `@/modules/entities/konstructor/lib`).
 *
 * Этот файл остался потому, что сущность шаблонов договоров уже импортирует
 * имена `*_VALUES` / `*Value` отсюда. Здесь они переименованы в канонические,
 * чтобы НЕ существовало второй копии подписей. Новый код импортирует из
 * `@/modules/entities/konstructor/lib` напрямую; этот модуль удаляется, когда
 * последний импорт отсюда уйдёт.
 */
export {
    CLIENT_TYPE_LABELS,
    CLIENT_TYPE_OPTIONS,
    CONTRACT_LTYPE_LABELS,
    CONTRACT_LTYPE_OPTIONS,
    SUPPLY_TYPE_LABELS,
    SUPPLY_TYPE_OPTIONS,
    TEMPLATE_SCOPE_LABELS,
    TEMPLATE_SCOPE_OPTIONS,
    ANY_CRITERIA_LABEL as ANY_VALUE_LABEL,
    EMPTY_CRITERIA_HELPER_TEXT,
    formatCriteriaList,
    getClientTypeLabel,
    getContractLtypeLabel,
    getSupplyTypeLabel,
    getTemplateScopeLabel,
    type TemplateCriteriaOption as LabelOption,
} from '../lib/consts/template-criteria.consts';

import {
    CLIENT_TYPE_CODES,
    CLIENT_TYPE_LABELS,
    CONTRACT_LTYPE_CODES,
    CONTRACT_LTYPE_LABELS,
    SUPPLY_TYPE_CODES,
    SUPPLY_TYPE_LABELS,
    TEMPLATE_SCOPE_CODES,
    formatCriteriaList,
    getClientTypeLabel,
    getContractLtypeLabel,
    getSupplyTypeLabel,
    type ClientTypeCode,
    type ContractLtypeCode,
    type SupplyTypeCode,
    type TemplateScopeCode,
} from '../lib/consts/template-criteria.consts';

/** Прежние имена типов — алиасы канонических. */
export type ContractLtypeValue = ContractLtypeCode;
export type ClientTypeValue = ClientTypeCode;
export type SupplyTypeValue = SupplyTypeCode;
export type TemplateScopeValue = TemplateScopeCode;

/**
 * Прежние объекты-перечисления `{ SERVICE: 'service' }`. Собраны из
 * канонических списков кодов, поэтому новый член перечисления попадает сюда
 * сам и расхождения двух копий быть не может.
 */
const enumOf = <T extends string>(
    codes: readonly T[],
): Readonly<Record<Uppercase<T>, T>> =>
    Object.fromEntries(
        codes.map((code) => [code.toUpperCase(), code]),
    ) as Readonly<Record<Uppercase<T>, T>>;

export const CONTRACT_LTYPE_VALUES = enumOf(CONTRACT_LTYPE_CODES);
export const CLIENT_TYPE_VALUES = enumOf(CLIENT_TYPE_CODES);
export const SUPPLY_TYPE_VALUES = enumOf(SUPPLY_TYPE_CODES);
export const TEMPLATE_SCOPE_VALUES = enumOf(TEMPLATE_SCOPE_CODES);

/** Прежние хелперы подписей. */
export const contractLtypeLabel = getContractLtypeLabel;
export const clientTypesLabel = (
    codes: readonly string[] | null | undefined,
): string => formatCriteriaList(codes, getClientTypeLabel);
export const supplyTypesLabel = (
    codes: readonly string[] | null | undefined,
): string => formatCriteriaList(codes, getSupplyTypeLabel);

export const labelOf = (
    dictionary: Readonly<Record<string, string>>,
    code: string | null | undefined,
): string => {
    if (code == null || code === '') {
        return 'Любой';
    }
    return Object.prototype.hasOwnProperty.call(dictionary, code)
        ? (dictionary[code] as string)
        : `Неизвестный код: ${code}`;
};

export const labelsOf = (
    dictionary: Readonly<Record<string, string>>,
    codes: readonly string[] | null | undefined,
): string => formatCriteriaList(codes, (code) => labelOf(dictionary, code));

export const optionsOf = (dictionary: Readonly<Record<string, string>>) =>
    Object.entries(dictionary).map(([value, label]) => ({ value, label }));

export const UNKNOWN_LABEL_PREFIX = 'Неизвестный код';

/** Ссылки на словари, чтобы `labelOf(CLIENT_TYPE_LABELS, …)` продолжал работать. */
export const DOCUMENT_TEMPLATE_DICTIONARIES = {
    CONTRACT_LTYPE_LABELS,
    CLIENT_TYPE_LABELS,
    SUPPLY_TYPE_LABELS,
} as const;
