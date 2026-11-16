'use client';

import { OfferPdfLetterCard } from './letter/OfferPdfLetterCard';
import { OfferPdfSettingsCard } from './settings/OfferPdfSettingsCard';

/** Встроенный PDF-шаблон: стиль с гаммой, настройки документа и письмо. */
export const OfferPdfTemplateCard = () => (
    <>
        <OfferPdfSettingsCard />
        <OfferPdfLetterCard />
    </>
);
