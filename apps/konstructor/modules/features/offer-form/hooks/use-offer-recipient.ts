'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    declineRecipientCase,
    offerDocumentActions,
    selectOfferCaseLoading,
    selectOfferRecipient,
    type OfferRecipientCaseField,
    type OfferRecipientField,
} from '@/modules/entities/offer-document';

/** Получатель КП: поля шапки, падеж по blur ФИО/должности. */
export const useOfferRecipient = () => {
    const dispatch = useAppDispatch();
    const recipient = useAppSelector(selectOfferRecipient);
    const caseLoading = useAppSelector(selectOfferCaseLoading);

    return {
        recipient,
        isCaseLoading: (field: OfferRecipientCaseField) => caseLoading.includes(field),
        setField: (field: OfferRecipientField, value: string) =>
            dispatch(offerDocumentActions.setRecipientField({ field, value })),
        blurCase: (field: OfferRecipientCaseField) => void dispatch(declineRecipientCase(field)),
    };
};
