'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    INVOICE_ANSWER_TITLE,
    invoiceNumberHint,
    offerDocumentActions,
    saveOfferInvoiceField,
    selectHasComparisonSets,
    selectInvoiceRequested,
    selectOfferInvoice,
    selectOfferInvoicePeek,
    selectOfferInvoiceSaveError,
    visibleInvoiceAnswers,
    type OfferInvoiceAnswer,
} from '@/modules/entities/offer-document';

/**
 * Счёт к КП: «Сделать счёт?», «Сделать счета для всех товаров?» (только когда
 * в КП есть наборы для сравнения), «Оплатить счёт до» и номер. Дата и номер
 * видны, когда просят хоть один счёт, и по blur пишутся в сделку.
 */
export const useOfferInvoice = () => {
    const dispatch = useAppDispatch();
    const invoice = useAppSelector(selectOfferInvoice);
    const withComparisonSets = useAppSelector(selectHasComparisonSets);
    const requested = useAppSelector(selectInvoiceRequested);
    const peek = useAppSelector(selectOfferInvoicePeek);
    const saveError = useAppSelector(selectOfferInvoiceSaveError);

    return {
        answers: visibleInvoiceAnswers(withComparisonSets).map(answer => ({
            answer,
            title: INVOICE_ANSWER_TITLE[answer],
            value: invoice[answer],
        })),
        // дата и номер нужны, пока просят хоть один счёт
        detailsVisible: requested,
        invoiceDate: invoice.invoiceDate,
        invoiceNumber: invoice.invoiceNumber,
        // пустой номер: подпись, что сейчас хранит нумератор (или что номер присвоит он)
        numberHint: invoiceNumberHint(invoice.invoiceNumber, peek),
        saveError,
        setAnswer: (answer: OfferInvoiceAnswer, value: boolean) =>
            dispatch(offerDocumentActions.setInvoiceAnswer({ answer, value })),
        setDate: (value: string) => dispatch(offerDocumentActions.setInvoiceDate(value)),
        setNumber: (value: string) => dispatch(offerDocumentActions.setInvoiceNumber(value)),
        saveDate: () => void dispatch(saveOfferInvoiceField('invoiceDate')),
        saveNumber: () => void dispatch(saveOfferInvoiceField('invoiceNumber')),
    };
};
