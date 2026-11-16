'use client';

import { useCallback } from 'react';
import { visibleOfferPdfToggles } from '../../../lib/offer-pdf-toggles';
import { useOfferPdfDocument } from '../../../model/OfferPdfDocumentContext';
import type { OfferPdfSettings } from '../../../model/types';

/** Настройки документа: значение, запись одного поля и переключатели стиля */
export const useOfferPdfSettingsForm = () => {
    const { settings, setSettings, template, documentNumber, setDocumentNumber } = useOfferPdfDocument();

    const setSetting = useCallback(
        <K extends keyof OfferPdfSettings>(key: K, value: OfferPdfSettings[K]) => setSettings({ [key]: value }),
        [setSettings],
    );

    return {
        settings,
        setSetting,
        toggles: visibleOfferPdfToggles(template),
        documentNumber,
        setDocumentNumber,
    };
};
