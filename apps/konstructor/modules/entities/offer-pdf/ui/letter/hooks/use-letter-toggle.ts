'use client';

import { useCallback } from 'react';
import { useOfferPdfDocument } from '../../../model/OfferPdfDocumentContext';

/** Переключатель письма: флаг лежит в настройках КП и уходит и в PDF-, и в Word-запрос */
export const useLetterToggle = () => {
    const { settings, setSettings } = useOfferPdfDocument();

    const setWithLetter = useCallback((withLetter: boolean) => setSettings({ withLetter }), [setSettings]);

    return { withLetter: settings.withLetter, setWithLetter };
};
