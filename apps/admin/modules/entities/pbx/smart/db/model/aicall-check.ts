/**
 * Ручные типы `GET /api/admin/pbx/smarts/aicall-check` — проверка полей
 * смарта «AI-анализ звонков» только чтением (до перегенерации orval-клиента).
 */

/** Поле конфига, которого нет на портале. */
export interface AicallMissingField {
    /** UF-имя поля на портале. */
    fieldName: string;
    /** Код поля в конфиге. */
    code: string;
    /** Название поля в карточке. */
    title: string;
    /** Раздел карточки; null — поле вне раскладки. */
    section: string | null;
    /** Поле сводки методики продаж. */
    methodology: boolean;
}

/** Поле-список, в котором не хватает значений. */
export interface AicallEnumGap {
    fieldName: string;
    title: string;
    /** Названия недостающих значений. */
    missing: string[];
}

/** Поле смарта, которого нет в конфиге: занимает место в лимите полей. */
export interface AicallExtraField {
    fieldName: string;
    /** Название на портале; пустая строка — не задано. */
    title: string;
}

export interface AicallCheckResult {
    domain: string;
    /** Смарт есть на портале. */
    installed: boolean;
    entityTypeId: number | null;
    /** Полей по конфигу. */
    expected: number;
    /** Из них есть на портале. */
    present: number;
    /** Всего пользовательских полей у смарта. */
    total: number;
    methodologyExpected: number;
    methodologyPresent: number;
    missing: AicallMissingField[];
    enumGaps: AicallEnumGap[];
    extra: AicallExtraField[];
}
