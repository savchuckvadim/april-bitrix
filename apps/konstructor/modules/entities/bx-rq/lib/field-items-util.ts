import {
    CONTRACT_RQ_GROUP,
    RQ_ITEM_CODE,
    RQ_TYPE,
    RQ_TYPE_NAME,
    type ResolvedRQType,
    type RqItem,
    type RqRecord,
} from '../model/types';
import { getResolvedType } from './rq-util';

/** Активные поля нужного типа клиента (ИНН — всегда), по порядку. */
export const filterFieldItems = (
    items: RqItem[],
    currentClientType: RQ_TYPE | undefined | null,
): RqItem[] => {
    const clientType = getResolvedType(currentClientType ?? RQ_TYPE.ORGANIZATION);

    return items
        .filter(
            rqItem =>
                rqItem.isActive &&
                (rqItem.includes.includes(clientType) ||
                    rqItem.code === RQ_ITEM_CODE.INN),
        )
        .sort((a, b) => a.order - b.order)
        .map(rqItem => ({ ...rqItem, group: CONTRACT_RQ_GROUP.RQ }));
};

const RQ_TYPE_NAMES: Record<RQ_TYPE, RQ_TYPE_NAME> = {
    [RQ_TYPE.ORGANIZATION]: RQ_TYPE_NAME.ORGANIZATION,
    [RQ_TYPE.BUDGET]: RQ_TYPE_NAME.BUDGET,
    [RQ_TYPE.IP]: RQ_TYPE_NAME.IP,
    [RQ_TYPE.FIZ]: RQ_TYPE_NAME.FIZ,
};

export const getClinetTypeNameByCode = (type: RQ_TYPE | null): RQ_TYPE_NAME =>
    type ? RQ_TYPE_NAMES[type] : RQ_TYPE_NAME.ORGANIZATION;

export const isFieldsEmpty = (fields: RqItem[]): boolean =>
    fields.every(field => !field.value);

const stringValue = (fields: RqItem[], code: string): string => {
    const field = fields.find(f => f.code === code);
    return field && field.type !== 'select' && typeof field.value === 'string'
        ? field.value
        : '';
};

/** ФИО из полей last/first/second_name + «Фамилия И.О.». */
export const getFullName = (
    fields: RqItem[],
): { fullName: string; initials: string } => {
    const lastName = stringValue(fields, RQ_ITEM_CODE.LAST_NAME);
    const firstName = stringValue(fields, RQ_ITEM_CODE.FIRST_NAME);
    const secondName = stringValue(fields, RQ_ITEM_CODE.SECOND_NAME);
    const initial = (value: string) =>
        value ? `${value.charAt(0).toUpperCase()}.` : '';
    return {
        fullName: [lastName, firstName, secondName].filter(Boolean).join(' '),
        initials: `${lastName} ${initial(firstName)}${initial(secondName)}`.trim(),
    };
};

const PUSH_BASE_CODES: string[] = [
    RQ_ITEM_CODE.INN,
    RQ_ITEM_CODE.FULLNAME,
    RQ_ITEM_CODE.SHORTNAME,
    RQ_ITEM_CODE.DIRECTOR_NAME,
    RQ_ITEM_CODE.DIRECTOR_POSITION,
    RQ_ITEM_CODE.PHONE,
    RQ_ITEM_CODE.DOCUMENT,
    RQ_ITEM_CODE.DOCUMENT_SERIES,
    RQ_ITEM_CODE.DOCUMENT_NUMBER,
    RQ_ITEM_CODE.PERSON_NAME,
];
const PUSH_ADDRESS_CODES: string[] = [
    'address_country',
    'address_city',
    'address_1',
    'address_postal_code',
];
const PUSH_BANK_CODES: string[] = [
    'bank_name',
    'bank_address',
    'bank_bik',
    'bank_pc',
    'bank_kc',
];

/** Названия незаполненных полей, без которых документ не собрать. */
export const validatePushRq = (
    currentClientType: RQ_TYPE,
    rq: RqRecord,
): string[] => {
    const resolvedType: ResolvedRQType = getResolvedType(currentClientType);
    const missing = (fields: RqItem[], codes: string[]) =>
        fields
            .filter(field => codes.includes(field.code) && !field.value)
            .map(field => field.name);

    return [
        ...missing(
            rq.fields.filter(field => field.includes.includes(resolvedType)),
            PUSH_BASE_CODES,
        ),
        ...rq.address.items.flatMap(ad => missing(ad.fields, PUSH_ADDRESS_CODES)),
        ...missing(rq.bank.current?.fields ?? [], PUSH_BANK_CODES),
    ];
};

export const getFieldValuByCode = (
    fields: RqItem[],
    code: string,
): string | null => stringValue(fields, code) || null;

/** Короткое имя реквизита для списка: юрлицо — shortname/fullname, физлицо — ФИО/фамилия. */
export const getRqShowName = (
    fields: RqItem[],
    clientType: RQ_TYPE,
    limit?: number,
): string => {
    const [primary, fallback] =
        clientType === RQ_TYPE.FIZ
            ? [RQ_ITEM_CODE.PERSON_NAME, RQ_ITEM_CODE.LAST_NAME]
            : [RQ_ITEM_CODE.SHORTNAME, RQ_ITEM_CODE.FULLNAME];
    const name =
        getFieldValuByCode(fields, primary) ??
        getFieldValuByCode(fields, fallback) ??
        'Реквизиты';
    return limit && name.length > limit ? `${name.slice(0, limit)}...` : name;
};
