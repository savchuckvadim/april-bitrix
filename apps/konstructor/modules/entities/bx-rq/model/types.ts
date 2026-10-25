/**
 * Доменные типы реквизитов конструктора. Транспортные DTO бэка — в `./dto`;
 * здесь — то, с чем работают slice, хуки и UI (поле реквизита как
 * дискриминированный union по `type`).
 */

export enum RQ_TYPE {
    ORGANIZATION = 'org',
    BUDGET = 'org_state',
    IP = 'ip',
    FIZ = 'fiz',
}

export enum RQ_TYPE_NAME {
    ORGANIZATION = 'Организация',
    BUDGET = 'Бюджетники',
    IP = 'ИП',
    FIZ = 'Физ лицо',
}

/** Тип, под которым реквизит лежит на бэке: бюджетники хранятся как организации. */
export type ResolvedRQType = Exclude<RQ_TYPE, RQ_TYPE.BUDGET>;

export enum CONTRACT_RQ_GROUP {
    RQ = 'rq',
    BANK = 'bank',
    ADDRESS = 'address',
    CONTRACT = 'contract',
    SPECIFICATION = 'specification',
    SUPPLY = 'supply',
}

export enum RQ_ITEM_CODE {
    FULLNAME = 'fullname',
    SHORTNAME = 'shortname',
    PERSON_NAME = 'personName',
    LAST_NAME = 'last_name',
    FIRST_NAME = 'first_name',
    SECOND_NAME = 'second_name',

    DIRECTOR_NAME = 'director',
    DIRECTOR_POSITION = 'position',
    DIRECTOR_CASE = 'director_case',
    DIRECTOR_POSITION_CASE = 'position_case',
    BASED = 'based',
    BASED_CASE = 'based_case',

    INN = 'inn',
    KPP = 'kpp',
    OGRN = 'ogrn',
    OGRNIP = 'ogrnip',
    ACCOUNTANT = 'accountant',

    OKPO = 'okpo',
    OKVED = 'okved',
    OKVED_DESCRIPTION = 'okved_description',
    OKVED_DESCRIPTION_CASE = 'okved_description_case',

    PHONE = 'phone',
    DOCUMENT = 'document',
    DOCUMENT_DATE = 'docDate',
    DOCUMENT_SERIES = 'docSer',
    DOCUMENT_NUMBER = 'docNum',
    ISSUED_BY = 'issued_by',
    DEPARTMENT_CODE = 'dep_code',

    BASE_OTHER = 'base_other',
}

export enum ADDRESS_RQ_ITEM_CODE {
    ADDRESS_COUNTRY = 'address_country',
    ADDRESS_PROVINCE = 'address_province',
    ADDRESS_REGION = 'address_region',
    ADDRESS_CITY = 'address_city',
    ADDRESS_1 = 'address_1',
    ADDRESS_2 = 'address_2',
    ADDRESS_POSTAL_CODE = 'address_postal_code',
}

export enum BANK_RQ_ITEM_CODE {
    BANK_NAME = 'bank_name',
    BANK_BIK = 'bank_bik',
    BANK_PC = 'bank_pc',
    BANK_KC = 'bank_kc',
    BANK_COMMENTS = 'comments',
    BANK_ADDRESS = 'bank_address',
}

/** Типы адресов Bitrix (crm.address): id одинаковы на всех порталах. */
export enum BX_ADDRESS_TYPE {
    PRIMARY = 1,
    REGISTERED = 6,
    REGISTERED_FIZ = 4,
}

export const addressMap = {
    [BX_ADDRESS_TYPE.PRIMARY]: { name_type: 'Фактический адрес', code: 'fact' },
    [BX_ADDRESS_TYPE.REGISTERED]: {
        name_type: 'Юридический адрес',
        code: 'registred',
    },
    [BX_ADDRESS_TYPE.REGISTERED_FIZ]: {
        name_type: 'Адрес прописки',
        code: 'registred_fiz',
    },
} as const;

export type AddressTypeId = keyof typeof addressMap;
export type AddressDetails = (typeof addressMap)[AddressTypeId];

export interface SelectItem {
    id: number;
    code: RQ_TYPE;
    name: string;
    title: string;
}

export type RqInputType = 'string' | 'text' | 'date' | 'select' | 'file';

export interface ARQInput<T = string> {
    type: RqInputType;
    name: string;
    isRequired: boolean;
    code: T;
    includes: RQ_TYPE[];
    group: CONTRACT_RQ_GROUP | null;
    isActive: boolean;
    isDisable: boolean;
    order: number;
    isHidden?: boolean;
}

export interface SelectInput<T = string> extends ARQInput<T> {
    type: 'select';
    items: SelectItem[];
    value: SelectItem | null;
}

export interface BXCurrentFile {
    id: number;
    downloadUrl: string;
}

export interface FileInput extends ARQInput<string> {
    type: 'file';
    file: File | undefined;
    value: string | BXCurrentFile;
}

export interface StringInput extends ARQInput<string> {
    type: 'string' | 'text' | 'date';
    value: string;
}

/** Поле реквизита/адреса/банка. */
export type RqItem = SelectInput | StringInput | FileInput;

export interface AddressRqItem {
    id?: number;
    anchor_id: number;
    type_id: BX_ADDRESS_TYPE;
    name_type: string;
    fields: RqItem[];
}

export interface RqAddressGroup {
    items: AddressRqItem[];
    current: AddressRqItem | null;
}

export interface BankRqItem {
    id: number;
    fields: RqItem[];
}

export interface RqBankGroup {
    items: BankRqItem[];
    current: BankRqItem | null;
    fields: RqItem[];
}

/** Реквизит компании (пресет Bitrix): поля + адреса + банки. bx_id -1 — ещё не создан. */
export interface RqRecord {
    bx_id: number;
    preset_id: number;
    fields: RqItem[];
    address: RqAddressGroup;
    bank: RqBankGroup;
    type: RQ_TYPE;
}

export interface RqGroup {
    items: RqRecord[];
    /** Пустой шаблон для создания первого реквизита этого типа. */
    default: RqRecord;
}

/** Все реквизиты компании по типам + текущий (выбранный на бэке). */
export interface RqBundle {
    [RQ_TYPE.ORGANIZATION]: RqGroup;
    [RQ_TYPE.IP]: RqGroup;
    [RQ_TYPE.FIZ]: RqGroup;
    current: RqRecord | null;
}
