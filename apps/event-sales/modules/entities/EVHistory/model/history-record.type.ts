/**
 * Доменные типы истории «ОП История».
 *
 * Запись читается по CRM-привязкам (`CO_/D_/L_/C_` в множественном поле
 * `crm`), поэтому у неё всегда есть список привязок — по нему UI группирует
 * «по сущностям» и считает повторы (одна запись видна из нескольких групп).
 */

/** Тип CRM-привязки записи (as const — значения остаются литералами). */
export const EHistoryBindingType = {
    COMPANY: 'company',
    DEAL: 'deal',
    LEAD: 'lead',
    CONTACT: 'contact',
} as const;

export type HistoryBindingType =
    (typeof EHistoryBindingType)[keyof typeof EHistoryBindingType];

/** Префиксы значений привязки в поле `crm` Битрикса. */
export const HISTORY_BINDING_PREFIX = {
    [EHistoryBindingType.COMPANY]: 'CO_',
    [EHistoryBindingType.DEAL]: 'D_',
    [EHistoryBindingType.LEAD]: 'L_',
    [EHistoryBindingType.CONTACT]: 'C_',
} as const;

/** Привязка контекста: по ней читается своя лента истории. */
export interface HistoryBinding {
    /** Значение фильтра Битрикса: `CO_431`, `D_5512`, `L_318051`, `C_917`. */
    value: string;
    type: HistoryBindingType;
    id: number;
    /** Человекочитаемое имя сущности для заголовка группы. */
    title: string;
    /** Только для лидов: классификация по признакам портала (lead-classification). */
    isSalesLead?: boolean;
    isSiteRequest?: boolean;
}

/** Значение enum-поля списка, разрезолвленное в код+имя портала. */
export interface HistoryEnumValue {
    code: string;
    name: string;
}

export interface EVHistoryRecord {
    id: number;
    /** Заголовок события; пусто — покажем NAME элемента. */
    title: string;
    comment: string;
    /** Дата события в формате портала (DD.MM.YYYY HH:mm:ss). */
    date: string;
    /** Timestamp для сортировки; null — дата не распарсилась. */
    dateTs: number | null;
    responsibleId: number | null;
    eventType: HistoryEnumValue | null;
    eventAction: HistoryEnumValue | null;
    resultStatus: HistoryEnumValue | null;
    /** Значения привязок записи (`CO_431`, `L_7`, ...). */
    bindings: string[];
}

/** Лента одной привязки: свои записи и своя пагинация. */
export interface EVHistoryGroupState {
    binding: HistoryBinding;
    /** ID записей группы в порядке выдачи портала. */
    ids: number[];
    /** Смещение следующей страницы; null — вся лента загружена. */
    next: number | null;
    total: number | null;
    isLoadingMore: boolean;
}
