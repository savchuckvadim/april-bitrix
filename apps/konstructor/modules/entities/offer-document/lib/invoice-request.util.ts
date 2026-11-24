import type { OfferInvoice } from '../../document-payload/model/dto';
import type { RowSet } from '../../row-set/model/types';
import type { OfferInvoiceAnswer, OfferInvoiceForm } from '../model/types';

/**
 * Вопросы о счёте, которые видит менеджер: «Сделать счёт?» — всегда, «Сделать
 * счета для всех товаров?» — только когда в КП есть наборы для сравнения.
 */
export const visibleInvoiceAnswers = (withComparisonSets: boolean): OfferInvoiceAnswer[] =>
    withComparisonSets ? ['needGeneralInvoice', 'needManyInvoices'] : ['needGeneralInvoice'];

/** Просят ли хоть один счёт: общий или на все товары. */
export const isInvoiceRequested = (invoice: Pick<OfferInvoice, 'needGeneralInvoice' | 'needManyInvoices'>): boolean =>
    invoice.needGeneralInvoice || invoice.needManyInvoices;

/**
 * В КП есть наборы для сравнения: хотя бы в одном из них есть строки. Пустой
 * набор в документ ничего не добавляет, счетов на «все товары» из него не будет.
 */
export const hasComparisonSets = (alternative: readonly RowSet[]): boolean =>
    alternative.some(set => set.rows.length > 0);

/**
 * Счёт для запроса КП (Word и PDF) из ответов на экране. Без наборов для
 * сравнения «счета для всех товаров» не спрашивают, поэтому в запрос уходит
 * `false`, даже если ответ «да» остался от прежнего состава КП. Вопрос о
 * презентации бэк не читает: всегда `false`. Дата и номер уходят, когда просят
 * хоть один счёт; оба ответа «нет» дают пустой счёт без даты и номера.
 */
export const buildRequestInvoice = (invoice: OfferInvoiceForm, withComparisonSets: boolean): OfferInvoice => {
    const needGeneralInvoice = invoice.needGeneralInvoice;
    const needManyInvoices = invoice.needManyInvoices && withComparisonSets;
    const requested = needGeneralInvoice || needManyInvoices;
    return {
        needGeneralInvoice,
        needManyInvoices,
        isByPresentationInvoices: false,
        invoiceDate: requested ? invoice.invoiceDate.trim() : '',
        invoiceNumber: requested ? invoice.invoiceNumber.trim() : '',
    };
};
