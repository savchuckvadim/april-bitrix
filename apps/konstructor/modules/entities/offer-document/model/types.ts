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
/**
 * Вопросы о счёте на экране. Вопрос о презентации (`isByPresentationInvoices`)
 * с экрана убран: бэк его не читает, в запрос он всегда уходит `false`.
 */
export type OfferInvoiceAnswer = Extract<keyof OfferInvoiceForm, 'needGeneralInvoice' | 'needManyInvoices'>;

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

/** Умолчания по решению владельца: «Сделать счёт?» — нет, «Сделать счета для всех товаров?» — нет */
export const DEFAULT_INVOICE: OfferInvoiceForm = {
    needGeneralInvoice: false,
    needManyInvoices: false,
    isByPresentationInvoices: false,
    invoiceDate: '',
    invoiceNumber: '',
};

export const INVOICE_ANSWER_TITLE: Record<OfferInvoiceAnswer, string> = {
    needGeneralInvoice: 'Сделать счёт',
    needManyInvoices: 'Сделать счета для всех товаров',
};

/**
 * Что нумератор сейчас хранит для счёта поставщика (peek, счётчик не растёт).
 * `rqId` — набор реквизитов, для которого спросили: ответ другого поставщика
 * отбрасывается. `loading` без `rqId` — ждём, пока загрузится поставщик.
 */
export type InvoicePeekStatus = 'idle' | 'loading' | 'ready' | 'failed';

export interface OfferInvoicePeek {
    status: InvoicePeekStatus;
    rqId: number | null;
    value: string | null;
}

export const INITIAL_INVOICE_PEEK: OfferInvoicePeek = { status: 'idle', rqId: null, value: null };
