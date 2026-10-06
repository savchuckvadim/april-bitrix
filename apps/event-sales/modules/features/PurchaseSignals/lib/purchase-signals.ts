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

/** Сроки конкурента — карточка «Конкуренты», рядом со справочником. */
export const CONCURENT_DATE_FIELDS = [
    { code: 'op_concurent_pay_date', label: 'Оплачено до' },
    { code: 'op_concurent_contract_date', label: 'Договор до' },
] as const;

/**
 * Свои сроки клиента — карточка «Покупка и договор» (владелец, 05.10.2026):
 * когда планирует купить, срок действующего договора и подарочный период.
 */
export const CONTRACT_DATE_FIELDS = [
    // Код по владельческой таблице install (todo2508): бывший op_possible_buy_date.
    {
        code: 'op_sale_date_prognoz',
        label: 'Плановая дата покупки',
        wide: true,
    },
    { code: 'contract_start', label: 'Договор с' },
    { code: 'contract_end', label: 'Договор по' },
    { code: 'contract_present_start', label: 'Период в подарок с' },
    { code: 'contract_present_end', label: 'Период в подарок по' },
] as const;

export const PURCHASE_DATE_FIELDS = [
    ...CONCURENT_DATE_FIELDS,
    ...CONTRACT_DATE_FIELDS,
] as const;

/**
 * Множественный справочник «Конкуренты». Код — как в шаблоне установки и
 * на порталах; прежний `op_concurents_multiple` не стоял ни на одном
 * портале, поэтому список конкурентов в карточке не появлялся.
 */
export const CONCURENTS_FIELD_CODE = 'concurents_multiple';

export type PurchaseDateCode = (typeof PURCHASE_DATE_FIELDS)[number]['code'];

/** Описание поля-даты: код в слепке портала и подпись в карточке. */
export interface PurchaseDateField {
    readonly code: PurchaseDateCode;
    readonly label: string;
    /** Одиночная дата без пары «с / по» — занимает всю строку карточки. */
    readonly wide?: boolean;
}

/** `YYYY-MM-DD` для `<input type=date>` из того, что отдал портал. */
export const toInputDate = (raw: unknown): string => {
    if (typeof raw !== 'string' || !raw.trim()) return '';
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const crm = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (crm) return `${crm[3]}-${crm[2]}-${crm[1]}`;
    return '';
};

/** Носитель полей: строка сущности и её поля в слепке портала. */
export interface SignalCarrier {
    row: Record<string, unknown>;
    fields: PBXField[] | null | undefined;
}

/** Дата, установленная хотя бы у одного носителя. */
export interface ResolvedDate {
    code: PurchaseDateCode;
    label: string;
    value: string;
    wide: boolean;
}

/**
 * Даты из списка, установленные ХОТЬ у одного носителя. Значение — первое
 * непустое по носителям (сделка точнее компании и стоит первой); правка
 * менеджера из `overrides` сильнее строки сущности.
 */
export const resolveDates = (
    carriers: readonly SignalCarrier[],
    fields: readonly PurchaseDateField[],
    overrides: Readonly<Record<string, string>>,
): ResolvedDate[] => {
    const dates: ResolvedDate[] = [];
    for (const field of fields) {
        let installed = false;
        let value = '';
        for (const carrier of carriers) {
            const key = findUfKey(carrier.fields, field.code);
            if (!key) continue;
            installed = true;
            if (!value) value = toInputDate(carrier.row[key]);
        }
        if (!installed) continue;
        dates.push({
            code: field.code,
            label: field.label,
            value: overrides[field.code] ?? value,
            wide: field.wide ?? false,
        });
    }
    return dates;
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
