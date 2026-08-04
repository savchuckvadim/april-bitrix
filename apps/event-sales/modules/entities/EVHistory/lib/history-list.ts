import type { Portal, PBXList } from '@workspace/pbx';

/**
 * Портальный список «ОП История» — источник истории работы по клиенту.
 *
 * Списки на портале различаются парой `group_type`, а их поля — кодом
 * `${group}_${type}_${code}`; ключ значения в элементе — `bitrixCamelId`
 * (`PROPERTY_951`). Ровно так их пишет бэкенд (`KpiEventItemModel`), поэтому
 * читаем той же схемой — иначе фронт и бэк разъедутся на первом же портале
 * с другими id.
 */

/** Пара group_type искомого списка. */
const HISTORY_LIST_CODE = 'sales_history';

/** Тип инфоблока универсальных списков Битрикса. */
export const HISTORY_IBLOCK_TYPE_ID = 'lists';

/** Логические коды полей истории, которые показываем. */
export const HISTORY_FIELD_CODES = {
    eventDate: 'event_date',
    eventTitle: 'event_title',
    comment: 'manager_comment',
    responsible: 'responsible',
    crmCompany: 'crm_company',
    crm: 'crm',
} as const;

export interface HistoryListRef {
    iblockId: number;
    /** Ключи свойств элемента: код поля → `PROPERTY_*`. */
    properties: Partial<Record<keyof typeof HISTORY_FIELD_CODES, string>>;
}

const findList = (portal: Portal | null): PBXList | undefined =>
    portal?.bitrixLists?.find(
        list => `${list.group}_${list.type}` === HISTORY_LIST_CODE,
    );

/**
 * Адрес списка и его полей на конкретном портале.
 * `null` — списка нет: история просто недоступна, это не ошибка.
 */
export const getHistoryListRef = (
    portal: Portal | null,
): HistoryListRef | null => {
    const list = findList(portal);
    if (!list?.bitrixId) return null;

    const properties: HistoryListRef['properties'] = {};
    (
        Object.keys(HISTORY_FIELD_CODES) as (keyof typeof HISTORY_FIELD_CODES)[]
    ).forEach(key => {
        const fullCode = `${list.group}_${list.type}_${HISTORY_FIELD_CODES[key]}`;
        const field = list.bitrixfields?.find(item => item.code === fullCode);
        if (field?.bitrixCamelId) properties[key] = field.bitrixCamelId;
    });

    return { iblockId: Number(list.bitrixId), properties };
};

/** Элемент списка как его отдаёт Битрикс: значения свойств — мапы. */
export type HistoryListElement = Record<string, unknown>;

export interface HistoryEntry {
    id: number;
    /** Заголовок события; пусто — покажем NAME элемента. */
    title: string;
    comment: string;
    date: string;
}

/**
 * Значение свойства списка приходит мапой `{ '123': 'текст' }` — Битрикс так
 * отдаёт множественные свойства, и одиночные тоже. Берём первое значение.
 */
const readProperty = (
    element: HistoryListElement,
    key: string | undefined,
): string => {
    if (!key) return '';
    const raw = element[key];
    if (raw === null || raw === undefined) return '';
    if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
    if (Array.isArray(raw)) return String(raw[0] ?? '');
    if (typeof raw === 'object') {
        const first = Object.values(raw as Record<string, unknown>)[0];
        return first === undefined || first === null ? '' : String(first);
    }
    return '';
};

export const toHistoryEntry = (
    element: HistoryListElement,
    ref: HistoryListRef,
): HistoryEntry => ({
    id: Number(element.ID ?? 0),
    title:
        readProperty(element, ref.properties.eventTitle) ||
        String(element.NAME ?? ''),
    comment: readProperty(element, ref.properties.comment),
    date:
        readProperty(element, ref.properties.eventDate) ||
        String(element.DATE_CREATE ?? ''),
});
