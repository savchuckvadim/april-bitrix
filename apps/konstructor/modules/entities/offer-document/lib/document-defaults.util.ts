// Глубокие импорты файлов-констант: баррель pbx-data тянет class-энтити
import { PBX_SALES_KONSTRUCTOR_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';
import { readFieldValue } from '@workspace/pbx';
import type { PBXField } from '../../portal';
import { EMPTY_RECIPIENT, type OfferInvoiceForm, type OfferRecipientForm } from '../model/types';
import { INVOICE_DEAL_FIELD_CODE } from './invoice-deal-field.util';

/**
 * Дефолты шапки КП из сделки и компании по pbx-кодам (доктрина
 * docs/pbx-fields-system.md): легаси читал UF_CRM_* по захардкоженным id
 * портала, здесь — по коду через слепок портала. Сделка в приоритете,
 * компания — запасной источник (легаси: deal → company).
 */

const RECIPIENT_CODE = {
    inn: PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_inn,
    name: PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_name,
    position: PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_position,
} as const;

type Entity = Record<string, unknown> | null | undefined;

export interface DocumentDefaultsInput {
    deal: Entity;
    company: Entity;
    dealFields: PBXField[] | null | undefined;
    companyFields: PBXField[] | null | undefined;
}

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Значение по коду: сначала сделка, потом компания. */
const pick = (input: DocumentDefaultsInput, code: string): string =>
    text(readFieldValue(input.dealFields, input.deal, code)) ||
    text(readFieldValue(input.companyFields, input.company, code));

export const resolveRecipientDefaults = (input: DocumentDefaultsInput): OfferRecipientForm => {
    const name = pick(input, RECIPIENT_CODE.name);
    const position = pick(input, RECIPIENT_CODE.position);
    return {
        ...EMPTY_RECIPIENT,
        companyName: text(input.company?.TITLE),
        inn: pick(input, RECIPIENT_CODE.inn),
        name,
        position,
        // до ответа бэка падеж равен исходнику — КП печатается и без склонения
        nameCase: name,
        positionCase: position,
    };
};

/** Дата Битрикса (ISO с зоной) → значение для input[type=date]; пусто/«N» — '' */
export const toInputDate = (value: unknown): string => {
    const raw = text(value);
    if (!raw || raw === 'N') return '';
    const date = raw.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
};

export const resolveInvoiceDefaults = (
    input: Pick<DocumentDefaultsInput, 'deal' | 'dealFields'>,
): Pick<OfferInvoiceForm, 'invoiceDate' | 'invoiceNumber'> => ({
    invoiceDate: toInputDate(readFieldValue(input.dealFields, input.deal, INVOICE_DEAL_FIELD_CODE.invoiceDate)),
    invoiceNumber: text(readFieldValue(input.dealFields, input.deal, INVOICE_DEAL_FIELD_CODE.invoiceNumber)),
});
