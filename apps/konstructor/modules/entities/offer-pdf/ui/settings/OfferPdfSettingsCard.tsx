'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { OfferPdfStylePicker } from '../style-picker/OfferPdfStylePicker';
import { OfferPdfContentModes } from './OfferPdfContentModes';
import { OfferPdfTextFields } from './OfferPdfTextFields';
import { OfferPdfToggles } from './OfferPdfToggles';

/** Стиль, гамма и настройки документа */
export const OfferPdfSettingsCard = () => (
    <SectionCard
        title="Стиль и настройки"
        description="Как выглядит документ и что в нём печатать. Превью обновится само, текст — после выхода из поля."
        tone="complect"
    >
        <div className="flex flex-col gap-5">
            <OfferPdfStylePicker />
            <OfferPdfContentModes />
            <OfferPdfToggles />
            <OfferPdfTextFields />
        </div>
    </SectionCard>
);
