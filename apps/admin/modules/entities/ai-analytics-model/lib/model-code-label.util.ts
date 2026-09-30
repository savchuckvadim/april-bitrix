import {
    UNKNOWN_STATUS_LABEL,
    type ModelCodeDictionary,
    type ModelStatusLabel,
} from '../consts/ai-analytics-model.labels.const';

/** Код бэка с русской подписью; `known = false` — подписи ещё нет. */
export interface ModelCodeView {
    code: string;
    label: string;
    known: boolean;
}

/** Подпись неизвестного кода: экран не падает, код виден рядом. */
export const UNKNOWN_CODE_LABEL = 'Неизвестный код';

const hasOwn = (dictionary: object, key: string): boolean =>
    Object.prototype.hasOwnProperty.call(dictionary, key);

/** Код → подпись; неизвестный код — нейтральная подпись, а не падение. */
export const codeViewOf = (
    dictionary: ModelCodeDictionary,
    code: string,
): ModelCodeView => {
    const label = hasOwn(dictionary, code) ? dictionary[code] : undefined;
    return label === undefined
        ? { code, label: UNKNOWN_CODE_LABEL, known: false }
        : { code, label, known: true };
};

/** Список причин → подписи; повторы убираются, порядок бэка сохраняется. */
export const reasonViewsOf = (
    dictionary: ModelCodeDictionary,
    reasons: readonly string[] | null | undefined,
): ModelCodeView[] =>
    [...new Set(reasons ?? [])].map(code => codeViewOf(dictionary, code));

/** Статус → подпись и тон; неизвестный статус — нейтральный бэйдж. */
export const statusViewOf = <TStatus extends string>(
    dictionary: Readonly<Record<TStatus, ModelStatusLabel>>,
    status: string,
): ModelStatusLabel =>
    hasOwn(dictionary, status)
        ? dictionary[status as TStatus]
        : UNKNOWN_STATUS_LABEL;
