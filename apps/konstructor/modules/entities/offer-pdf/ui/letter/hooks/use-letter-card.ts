'use client';

import { useCallback, useState } from 'react';
import { LETTER_CARD_DESCRIPTION, LETTER_OFF_DESCRIPTION } from '../../../lib/offer-letter-texts';
import { useOfferPdfDocument } from '../../../model/OfferPdfDocumentContext';

/**
 * Карточка письма: открыта, когда в ней уже есть текст; письмо выключено —
 * карточка свёрнута и не раскрывается, пока его не включат.
 */
export const useLetterCard = () => {
    const { letter, setLetter, settings } = useOfferPdfDocument();
    const { withLetter } = settings;
    const [userOpen, setUserOpen] = useState(Boolean(letter.appeal || letter.text));

    const setOpen = useCallback(
        (next: boolean) => {
            if (withLetter) setUserOpen(next);
        },
        [withLetter],
    );

    return {
        letter,
        setLetter,
        withLetter,
        open: withLetter && userOpen,
        setOpen,
        description: withLetter ? LETTER_CARD_DESCRIPTION : LETTER_OFF_DESCRIPTION,
    };
};
