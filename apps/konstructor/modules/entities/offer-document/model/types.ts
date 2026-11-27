import type { SalesFlowFields } from '@/modules/app/lib/sales-flow.util';
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

/**
 * Сделка презентации: сделка воронки «ОП Презентации» той же компании,
 * которая ссылается на основную полем `to_base_sales`. Менеджер выбирает ту,
 * после которой отправляется КП.
 */
export interface PresentationDeal {
    id: number;
    title: string;
    /** Дата создания как отдаёт Битрикс (ISO с зоной); нет — пустая строка */
    createdAt: string;
    stageId: string;
}

export type PresentationLoadStatus = 'idle' | 'loading' | 'ready' | 'failed';

/**
 * Вопрос «Документы в продолжение презентации?»: загруженные сделки презентации
 * и ответ менеджера. Вопрос виден, только когда сделки есть. «Да» с одной
 * сделкой выбирает её сама; с несколькими нужен явный выбор (`dealId`), пока его
 * нет, КП не формируется.
 */
export interface OfferPresentationState {
    status: PresentationLoadStatus;
    /** Сделки презентации, свежие первыми */
    items: PresentationDeal[];
    answer: boolean;
    /** Выбранная презентация при нескольких сделках */
    dealId: number | null;
}

export const INITIAL_PRESENTATION: OfferPresentationState = {
    status: 'idle',
    items: [],
    answer: false,
    dealId: null,
};

/** Поле `presentation` запроса КП: после какой презентации отправляется документ. */
export interface OfferPresentationRef {
    dealId: number;
}

/**
 * Необязательное поле КП в Word и PDF. Сгенерированный клиент его пока не
 * знает; после `pnpm run generate` расширение можно убрать.
 */
export interface OfferPresentationFields {
    presentation?: OfferPresentationRef;
}

/** Поля потока продаж запросов КП: признак отдела и презентация. */
export type OfferSalesFlowFields = SalesFlowFields & OfferPresentationFields;

/**
 * Поле `withLetter` Word-запроса: КП без сопроводительного письма. Есть только
 * при `false`; без него бэк печатает письмо, как раньше. Сгенерированный
 * клиент поле пока не знает; после `pnpm run generate` расширение можно убрать.
 */
export interface OfferLetterFields {
    withLetter?: boolean;
}
