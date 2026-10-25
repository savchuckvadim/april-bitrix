import type { OfferInvoice, OfferRecipient } from '../../document-payload';

/**
 * Параметры КП, которые правит менеджер на экране документа (легаси
 * document-reducer: recipient + invoice-questions). Содержание КП (комплект,
 * цены, поставка) берётся из row-set и каталога — здесь только «шапка».
 */
export type OfferRecipientForm = OfferRecipient;
export type OfferInvoiceForm = OfferInvoice;

export type OfferRecipientField = keyof OfferRecipientForm;
/** Поля, у которых есть падёжная пара (`nameCase`, `positionCase`) */
export type OfferRecipientCaseField = 'name' | 'position';
export type OfferInvoiceAnswer = Extract<
    keyof OfferInvoiceForm,
    'needGeneralInvoice' | 'needManyInvoices' | 'isByPresentationInvoices'
>;

export type OfferGenerateStatus = 'idle' | 'generating' | 'done' | 'error';

export interface OfferGeneratedLink {
    link: string;
    name: string;
    type: string;
}

export interface OfferGenerateResult {
    status: OfferGenerateStatus;
    error: string | null;
    /** Джоба очереди (прод): документы придут в сделку сами */
    operationId: string | null;
    /** Готовые ссылки (withoutQueue, dev) */
    links: OfferGeneratedLink[];
    /** Что не сошлось при слиянии вариантов — показать менеджеру */
    warnings: string[];
}

export const CASE_FIELD_OF: Record<OfferRecipientCaseField, 'nameCase' | 'positionCase'> = {
    name: 'nameCase',
    position: 'positionCase',
};

export const EMPTY_RECIPIENT: OfferRecipientForm = {
    name: '',
    nameCase: '',
    inn: '',
    companyName: '',
    position: '',
    positionCase: '',
};

/** Легаси INVOICE_QUESTION: счёт — да, на все товары — да, после презентации — нет */
export const DEFAULT_INVOICE: OfferInvoiceForm = {
    needGeneralInvoice: true,
    needManyInvoices: true,
    isByPresentationInvoices: false,
    invoiceDate: '',
    invoiceNumber: '',
};

export const INVOICE_ANSWER_TITLE: Record<OfferInvoiceAnswer, string> = {
    needGeneralInvoice: 'Сделать счёт',
    needManyInvoices: 'Счета на все товары',
    isByPresentationInvoices: 'Документы в продолжение презентации',
};
