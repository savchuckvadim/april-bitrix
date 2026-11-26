import type { OfferInvoiceForm, OfferRecipientForm, PresentationSummaryInput } from '@/modules/entities/offer-document';
import type { OfferPartyAnchor } from './offer-party-anchor.util';

export type OfferPartyFactId = 'recipient' | 'provider' | 'invoice' | 'presentation';

/** Строка сводки «Кому / От кого / Счёт» в «Сборке». */
export interface OfferPartyFact {
    id: OfferPartyFactId;
    label: string;
    value: string;
    /** Значения нет или оно не выбрано: красим токеном предупреждения */
    isValueWarning: boolean;
    /** Вторая строка: ИНН, срок оплаты */
    note: string | null;
    isNoteWarning: boolean;
    /** Карточка наверху экрана, к которой ведёт строка */
    anchor: OfferPartyAnchor;
}

export interface OfferPartiesInput {
    recipient: Pick<OfferRecipientForm, 'companyName' | 'inn'>;
    /** Название выбранного поставщика; null — поставщик не выбран */
    providerName: string | null;
    /** Счёт в том виде, в каком он уходит в запрос КП */
    invoice: Pick<OfferInvoiceForm, 'needGeneralInvoice' | 'needManyInvoices' | 'invoiceDate' | 'invoiceNumber'>;
    /** Ответ «Документы в продолжение презентации?»; null — «Нет» или вопроса нет, строки не будет */
    presentation: PresentationSummaryInput | null;
}

export const OFFER_PARTY_COMPANY_EMPTY = 'компания не указана';
export const OFFER_PARTY_INN_EMPTY = 'ИНН не заполнен';
export const OFFER_PARTY_PROVIDER_EMPTY = 'поставщик не выбран';
export const OFFER_PARTY_INVOICE_NONE = 'нет';
export const OFFER_PARTY_INVOICE_AUTO_NUMBER = 'номер присвоит нумератор';
export const OFFER_PARTY_INVOICE_DATE_EMPTY = 'срок оплаты не указан';
export const OFFER_PARTY_PRESENTATION_EMPTY = 'презентация не выбрана';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Дата поля `input[type=date]` (гггг-мм-дд) → «дд.мм.гггг»; другой вид оставляем как есть. */
export const formatInvoiceDate = (value: string): string => {
    const raw = value.trim();
    const match = ISO_DATE.exec(raw);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : raw;
};

const recipientFact = ({ companyName, inn }: OfferPartiesInput['recipient']): OfferPartyFact => {
    const company = companyName.trim();
    const innText = inn.trim();
    return {
        id: 'recipient',
        label: 'Кому',
        value: company || OFFER_PARTY_COMPANY_EMPTY,
        isValueWarning: !company,
        note: innText ? `ИНН ${innText}` : OFFER_PARTY_INN_EMPTY,
        isNoteWarning: !innText,
        anchor: 'recipient',
    };
};

const providerFact = (providerName: string | null): OfferPartyFact => {
    const name = providerName?.trim() ?? '';
    return {
        id: 'provider',
        label: 'От кого',
        value: name || OFFER_PARTY_PROVIDER_EMPTY,
        isValueWarning: !name,
        note: null,
        isNoteWarning: false,
        anchor: 'sender',
    };
};

const invoiceFact = (invoice: OfferPartiesInput['invoice']): OfferPartyFact => {
    const base = { id: 'invoice', label: 'Счёт', anchor: 'sender' } as const;
    if (!invoice.needGeneralInvoice && !invoice.needManyInvoices) {
        return { ...base, value: OFFER_PARTY_INVOICE_NONE, isValueWarning: false, note: null, isNoteWarning: false };
    }
    const number = invoice.invoiceNumber.trim();
    const date = formatInvoiceDate(invoice.invoiceDate);
    const numberText = number ? `№ ${number}` : OFFER_PARTY_INVOICE_AUTO_NUMBER;
    return {
        ...base,
        value: date ? `${numberText} до ${date}` : numberText,
        isValueWarning: false,
        note: date ? null : OFFER_PARTY_INVOICE_DATE_EMPTY,
        isNoteWarning: !date,
    };
};

/** Строка «Презентация»: название выбранной презентации; «Да» без выбора помечено предупреждением. */
const presentationFact = ({ title }: PresentationSummaryInput): OfferPartyFact => {
    const name = title?.trim() ?? '';
    return {
        id: 'presentation',
        label: 'Презентация',
        value: name || OFFER_PARTY_PRESENTATION_EMPTY,
        isValueWarning: !name,
        note: null,
        isNoteWarning: false,
        anchor: 'sender',
    };
};

/**
 * Строки сводки «Кому / От кого / Счёт / Презентация»: название компании и ИНН,
 * поставщик, счёт (нет либо номер и срок оплаты) и презентация, после которой
 * отправляется КП (только при ответе «Да»). Чего не хватает, помечено
 * предупреждением.
 */
export const buildOfferPartyFacts = ({
    recipient,
    providerName,
    invoice,
    presentation,
}: OfferPartiesInput): OfferPartyFact[] => [
    recipientFact(recipient),
    providerFact(providerName),
    invoiceFact(invoice),
    ...(presentation ? [presentationFact(presentation)] : []),
];
