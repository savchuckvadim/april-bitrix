import { findPortalField, findUfKey } from '@workspace/pbx';
import type { PBXField } from '@/modules/app/types/portal/portal-type';

/**
 * Поля «когда клиент купит и кто его держит» — данные и резолв, без UI.
 *
 * Смысл блока: «Возможная дата покупки» бессмысленна в отрыве от сроков
 * конкурента — клиент освобождается, когда у того кончается оплата или
 * договор. Поэтому поля показываются ВМЕСТЕ и обязательны к ознакомлению
 * (не к заполнению: отправку не блокируют).
 */

export const PURCHASE_DATE_FIELDS = [
    // Код по владельческой таблице install (todo2508): бывший op_possible_buy_date.
    { code: 'op_sale_date_prognoz', label: 'Плановая дата покупки' },
    { code: 'op_concurent_pay_date', label: 'Конкуренты: оплачено до' },
    { code: 'op_concurent_contract_date', label: 'Конкуренты: договор до' },
] as const;

export const CONCURENTS_FIELD_CODE = 'op_concurents_multiple';

export type PurchaseDateCode = (typeof PURCHASE_DATE_FIELDS)[number]['code'];

/** `YYYY-MM-DD` для `<input type=date>` из того, что отдал портал. */
export const toInputDate = (raw: unknown): string => {
    if (typeof raw !== 'string' || !raw.trim()) return '';
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const crm = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (crm) return `${crm[3]}-${crm[2]}-${crm[1]}`;
    return '';
};

/** Вариант справочника конкурентов: код общий для всех сущностей, имя — с портала. */
export interface ConcurentOption {
    code: string;
    name: string;
}

/**
 * Варианты справочника «Конкуренты» у носителя, где поле установлено.
 *
 * Именно ВАРИАНТЫ, а не только выбранные: до 02.09 карточка показывала
 * конкурентов бэйджами и лишь когда они уже стояли в CRM — пустое поле
 * было невидимо, и владелец не находил в UI «проинсталлированное поле».
 * Выбирать конкурентов нужно здесь же, где смотрят даты его договора.
 */
export const readConcurentOptions = (
    fields: PBXField[] | null | undefined,
): ConcurentOption[] => {
    const field = findPortalField(fields, CONCURENTS_FIELD_CODE);
    if (!field) return [];
    return field.items
        .filter(item => item.code)
        .map(item => ({ code: item.code, name: item.name }));
};

/**
 * Коды выбранных конкурентов из multiple-enum значения строки носителя.
 *
 * Именно КОДЫ: у компании, сделки и лида справочник свой, числовые id
 * элементов разные, и общий язык между носителями — только код варианта.
 */
export const readConcurentCodes = (
    fields: PBXField[] | null | undefined,
    row: Record<string, unknown> | null | undefined,
): string[] => {
    const field = findPortalField(fields, CONCURENTS_FIELD_CODE);
    const key = findUfKey(fields, CONCURENTS_FIELD_CODE);
    if (!field || !key || !row) return [];

    const raw = row[key];
    const ids = Array.isArray(raw) ? raw.map(String) : [];
    return ids
        .map(id => field.items.find(item => String(item.bitrixId) === id)?.code)
        .filter((code): code is string => Boolean(code));
};

/**
 * Значение multiple-enum поля носителя по кодам вариантов.
 *
 * Нет поля у носителя — null (писать некуда). Код без пары в справочнике
 * носителя выпадает молча: писать чужой id значило бы положить в карточку
 * случайного конкурента. Пусто — `''`: пустой массив в query-строке фрейма
 * исчезает целиком, и поле осталось бы неочищенным.
 */
export const toConcurentFieldValue = (
    fields: PBXField[] | null | undefined,
    codes: readonly string[],
): { key: string; value: string[] | '' } | null => {
    const field = findPortalField(fields, CONCURENTS_FIELD_CODE);
    const key = findUfKey(fields, CONCURENTS_FIELD_CODE);
    if (!field || !key) return null;

    const ids = codes
        .map(code => field.items.find(item => item.code === code)?.bitrixId)
        .filter((id): id is NonNullable<typeof id> => id != null)
        .map(String);

    return { key, value: ids.length ? ids : '' };
};
