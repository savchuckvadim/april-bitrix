'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    INVOICE_ANSWER_TITLE,
    offerDocumentActions,
    selectOfferInvoice,
    type OfferInvoiceAnswer,
} from '@/modules/entities/offer-document';

const ANSWERS = Object.keys(INVOICE_ANSWER_TITLE) as OfferInvoiceAnswer[];

/** Счёт к КП: три вопроса легаси-меню, дата первой оплаты и номер счёта. */
export const useOfferInvoice = () => {
    const dispatch = useAppDispatch();
    const invoice = useAppSelector(selectOfferInvoice);

    return {
        invoice,
        answers: ANSWERS.map(answer => ({
            answer,
            title: INVOICE_ANSWER_TITLE[answer],
            value: invoice[answer],
        })),
        // без счёта остальные вопросы не имеют смысла
        detailsEnabled: invoice.needGeneralInvoice,
        setAnswer: (answer: OfferInvoiceAnswer, value: boolean) =>
            dispatch(offerDocumentActions.setInvoiceAnswer({ answer, value })),
        setDate: (value: string) => dispatch(offerDocumentActions.setInvoiceDate(value)),
        setNumber: (value: string) => dispatch(offerDocumentActions.setInvoiceNumber(value)),
    };
};
