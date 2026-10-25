// Глубокие импорты файлов-констант: баррель pbx-data тянет class-энтити
import { PBX_SALES_KONSTRUCTOR_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';

/**
 * Договор: поля сделки Bitrix, которые печатаются в документе и правятся с
 * экрана (легаси DocumentPBXCard `allowed` + pushRequired). Значение живёт в
 * сделке — по blur пишем в Bitrix, в payload договора уходит из этого же
 * состояния.
 */
export type ContractDealFieldType = 'date' | 'string' | 'email';

export interface ContractDealField {
    /** pbx-код поля сделки */
    code: string;
    label: string;
    type: ContractDealFieldType;
    required: boolean;
    /** Как поле называется в ContractGenerateDto */
    /** Как поле называется в ContractGenerateDto; null — в payload договора не уходит */
    payloadKey:
        | 'contractCreateDate'
        | 'contractStart'
        | 'contractEnd'
        | 'firstPayDate'
        | 'garantClientAssignedName'
        | 'garantClientEmail'
        | null;
}

const CODES = PBX_SALES_KONSTRUCTOR_FIELD_CODES;

export const CONTRACT_DEAL_FIELDS: ContractDealField[] = [
    { code: CODES.contract_create_date, label: 'Договор от', type: 'date', required: false, payloadKey: 'contractCreateDate' },
    { code: CODES.contract_start, label: 'Действие договора с', type: 'date', required: true, payloadKey: 'contractStart' },
    { code: CODES.contract_end, label: 'Действие договора по', type: 'date', required: true, payloadKey: 'contractEnd' },
    { code: CODES.first_pay_date, label: 'Внести предоплату не позднее', type: 'date', required: false, payloadKey: 'firstPayDate' },
    {
        code: CODES.garant_client_assigned_name,
        label: 'Ответственный за получение справочника',
        type: 'string',
        required: true,
        payloadKey: 'garantClientAssignedName',
    },
    { code: CODES.garant_client_email, label: 'Email для интернет-версии', type: 'email', required: false, payloadKey: 'garantClientEmail' },
];

/**
 * Поля сделки для отчёта о поставке (легаси DocumentSupplyReport allowedPBX1/2 +
 * pushRequired): даты договора и поставки, email интернет-версии, период в
 * подарок, ответственный за справочник и его телефон. В payload договора не
 * уходят — отчёт читает их из bxDealItems по коду.
 */
export const SUPPLY_REPORT_DEAL_FIELDS: ContractDealField[] = [
    { code: CODES.first_pay_date, label: 'Дата первой оплаты', type: 'date', required: true, payloadKey: null },
    { code: CODES.contract_start, label: 'Действие договора с', type: 'date', required: true, payloadKey: null },
    { code: CODES.contract_end, label: 'Действие договора по', type: 'date', required: true, payloadKey: null },
    { code: CODES.supply_date, label: 'Дата поставки', type: 'date', required: true, payloadKey: null },
    { code: CODES.garant_client_email, label: 'Email для интернет-версии', type: 'email', required: true, payloadKey: null },
    { code: CODES.contract_present_start, label: 'Период в подарок с', type: 'date', required: false, payloadKey: null },
    { code: CODES.contract_present_end, label: 'Период в подарок по', type: 'date', required: false, payloadKey: null },
    {
        code: CODES.garant_client_assigned_name,
        label: 'Ответственный за получение справочника',
        type: 'string',
        required: true,
        payloadKey: null,
    },
    {
        code: CODES.garant_client_assigned_phone,
        label: 'Телефон ответственного',
        type: 'string',
        required: true,
        payloadKey: null,
    },
];

/** Все поля сделки, которые правят экраны документов (для записи в Bitrix по коду). */
export const ALL_DEAL_DOCUMENT_FIELDS: ContractDealField[] = [
    ...CONTRACT_DEAL_FIELDS,
    ...SUPPLY_REPORT_DEAL_FIELDS.filter(
        field => !CONTRACT_DEAL_FIELDS.some(contractField => contractField.code === field.code),
    ),
];

/** Значения полей сделки по pbx-коду (строки input'ов) */
export type ContractDealFieldValues = Record<string, string>;

export type ContractFormStatus = 'idle' | 'loading' | 'ready' | 'error';
export type ContractGenerateStatus = 'idle' | 'generating' | 'done' | 'error';

export interface ContractGenerateResult {
    status: ContractGenerateStatus;
    error: string | null;
    /** Публичная ссылка на DOCX договора */
    link: string | null;
    documentName: string | null;
}
