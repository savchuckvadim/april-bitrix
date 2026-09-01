/**
 * ЧИСТАЯ ГОЛОВА back/libs/portal-lib/pbx/smart-item-fields/
 * pbx-smart-item-fields.service.ts: типы SmartItemField*, normalizeSmartFieldName
 * и findSmartItemField — 1:1 со строк 4–63 донора.
 *
 * TODO(А2): сам класс PbxSmartItemFieldsService ОТРЕЗАН — он серверный
 * (@Injectable, PBXService, Logger, кэш crm.item.fields на процесс). Чтение
 * живых полей смарта в браузере поедет через FlowTransport, когда прямой
 * путь начнёт писать в смарты (сегодня allowSmartWrites=false — смарты
 * всегда досылкой).
 */
/** Элемент справочника поля элемента: id — ровно то, что уходит в запись. */
export interface SmartItemFieldItem {
    /** Числовой идентификатор значения (Битрикс ждёт именно его). */
    id: number;
    /** Подпись значения ровно как её показывает портал. */
    value: string;
}

/** Живое поле элемента смарта в двух именах сразу. */
export interface SmartItemField {
    /**
     * ФАКТИЧЕСКИЙ ключ `crm.item` (camel) — его и только его примет
     * `crm.item.add` / `crm.item.update`.
     */
    key: string;
    /** UF-имя (`meta.upperName`) — якорь портального каталога анкет. */
    upperName: string;
    /** `userTypeId` поля: string, date, enumeration и т.д. */
    type: string;
    isMultiple: boolean;
    /** Подпись поля в карточке — только для внятных предупреждений. */
    title: string;
    /** Элементы списка; у неперечислимых полей — пустой массив. */
    items: SmartItemFieldItem[];
}

/** Карта живых полей одного смарта. */
export interface SmartItemFields {
    entityTypeId: number;
    /** Ключ — UF-имя, нормализованное {@link normalizeSmartFieldName}. */
    byNormalizedName: Record<string, SmartItemField>;
}

/** Запись кэша: null (не прочитали) кэшируется тоже. */
interface SmartItemFieldsCacheEntry {
    fields: SmartItemFields | null;
    expiresAt: number;
}

/** TTL кэша: поля смарта правят руками редко, 10 минут — безопасный лаг. */
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Имя поля без подчёркиваний и регистра.
 *
 * Тот же приём, которым `PbxPresentationSmartService` уже ловит боевой
 * инцидент `UF_CRM_94_TRANSCRIPT_1`: сравнивать имена буква в букву нельзя —
 * портал и Битрикс расходятся в подчёркиваниях и регистре, а имя поля
 * это ЯКОРЬ каталога анкет.
 */
export const normalizeSmartFieldName = (name: string): string =>
    name.replace(/_/g, '').toLowerCase();

/** Поле по UF-имени; неизвестное имя — undefined. */
export const findSmartItemField = (
    fields: SmartItemFields,
    upperName: string,
): SmartItemField | undefined =>
    fields.byNormalizedName[normalizeSmartFieldName(upperName)];

