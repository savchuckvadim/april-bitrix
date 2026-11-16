'use client';

import { useCallback, useEffect, useState } from 'react';
import { offerPdfStyleSummary } from '../../../lib/offer-pdf-palette.util';
import { loadOfferPdfSettingsOpen, saveOfferPdfSettingsOpen } from '../../../lib/offer-pdf-storage';
import { useOfferPdfDocument } from '../../../model/OfferPdfDocumentContext';

const OPEN_HINT = 'Как выглядит документ и что в нём печатать. Превью обновится само, текст — после выхода из поля.';

/**
 * Карточка стиля и настроек сворачивается, и браузер это помнит; свёрнутая
 * показывает в подписи выбранный стиль с гаммой.
 */
export const useSettingsCard = () => {
    const { template, palette } = useOfferPdfDocument();
    const [open, setOpenState] = useState(true);

    // хранилище браузера читаем после монтирования — иначе разойдётся с SSR
    useEffect(() => {
        const stored = loadOfferPdfSettingsOpen();
        if (stored !== null) setOpenState(stored);
    }, []);

    const setOpen = useCallback((next: boolean) => {
        setOpenState(next);
        saveOfferPdfSettingsOpen(next);
    }, []);

    return {
        open,
        setOpen,
        description: open ? OPEN_HINT : (offerPdfStyleSummary(template, palette) ?? OPEN_HINT),
    };
};
