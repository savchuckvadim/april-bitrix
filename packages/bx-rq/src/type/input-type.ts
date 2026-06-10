export enum CONTRACT_RQ_GROUP {
    RQ = 'rq',
    BANK = 'bank',
    ADDRESS = 'address',
    CONTRACT = 'contract',
    SPECIFICATION = 'specification',
    SUPPLY = 'supply',
}

// Общий тип для элементов, которые входят в массив items
export interface SelectItem {
    id: number;
    code: RQ_TYPE;
    name: string;
    title: string;
}

export interface ARQInput<T = string> {
    type: 'string' | 'text' | 'date' | 'select' | 'file';
    name: string;
    isRequired: boolean;
    code: T;
    includes: Array<RQ_TYPE>;
    supplies?: Array<SupplyTypesType>;
    contractType?: Array<CONTRACT_LTYPE>;
    group: CONTRACT_RQ_GROUP | null;
    isActive: boolean;
    isDisable: boolean;
    order: number;
    component?: 'base' | 'contract' | 'invoice' | 'client';
    isHidden?: boolean; //скрытый
}
// Тип для объектов с type 'select'
export interface SelectInput<T = string> extends ARQInput<T> {
    type: 'select';
    items: SelectItem[];
    value: SelectItem;
}
export interface FileInput extends ARQInput<string> {
    type: 'file';
    file: File | undefined;
    value: string | BXCurrentFile | BXCurrentSmartFile;
}

export interface BXCurrentFile {
    id: number;
    downloadUrl: string;
}

export interface BXCurrentSmartFile {
    id: number;
    url: string;
}

// Тип для объектов с type 'string'
export interface StringInput extends ARQInput<string> {
    type: 'string' | 'text' | 'date';
    value: string;
}

export type DocumentInputValue = string | null;
// Объединение типов для массива rq
export type RqItem = SelectInput | StringInput | FileInput;

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

export enum SupplyTypeEnum {
    INTERNET = 'internet',
    PROXIMA = 'proxima',
}

export type SupplyTypesType = SupplyTypeEnum.INTERNET | SupplyTypeEnum.PROXIMA;
export enum CONTRACT_LTYPE {
    SERVICE = 'service',
    ABON = 'abon',
    LIC = 'lic',
    KEY = 'key',
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
    ACCOUNTANT = 'accountant', //fio gb

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
