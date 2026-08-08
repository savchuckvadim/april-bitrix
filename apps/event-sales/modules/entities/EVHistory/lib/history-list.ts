import type { Portal, PBXList, PBXFieldItem } from '@workspace/pbx';

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

/**
 * Логические коды полей истории (реестр pbx-sales-kpi-list; поле `crm` —
 * множественное, бэк пишет туда все привязки события: CO_/D_/L_/C_).
 */
export const HISTORY_FIELD_CODES = {
    eventDate: 'event_date',
    eventTitle: 'event_title',
    comment: 'manager_comment',
    responsible: 'responsible',
    crm: 'crm',
    eventType: 'event_type',
    eventAction: 'event_action',
    resultStatus: 'op_result_status',
} as const;

export type HistoryFieldKey = keyof typeof HISTORY_FIELD_CODES;

/** Поле элемента: ключ `PROPERTY_*` + items для резолва enum-значений. */
export interface HistoryFieldRef {
    key: string;
    items: PBXFieldItem[];
}

export interface HistoryListRef {
    iblockId: number;
    properties: Partial<Record<HistoryFieldKey, HistoryFieldRef>>;
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
    (Object.keys(HISTORY_FIELD_CODES) as HistoryFieldKey[]).forEach(key => {
        const fullCode = `${list.group}_${list.type}_${HISTORY_FIELD_CODES[key]}`;
        const field = list.bitrixfields?.find(item => item.code === fullCode);
        if (field?.bitrixCamelId) {
            properties[key] = {
                key: field.bitrixCamelId,
                items: field.items ?? [],
            };
        }
    });

    return { iblockId: Number(list.bitrixId), properties };
};

/** SELECT для lists.element.get: системные поля + все известные PROPERTY_*. */
export const getHistorySelect = (ref: HistoryListRef): string[] => [
    'ID',
    'NAME',
    'DATE_CREATE',
    ...Object.values(ref.properties).map(property => property.key),
];
