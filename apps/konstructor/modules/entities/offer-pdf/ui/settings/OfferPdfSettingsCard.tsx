'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { OfferPdfCurrentStyle } from '../style-picker/OfferPdfCurrentStyle';
import { useSettingsCard } from './hooks/use-settings-card';
import { OfferPdfContentModes } from './OfferPdfContentModes';
import { OfferPdfTextFields } from './OfferPdfTextFields';
import { OfferPdfToggles } from './OfferPdfToggles';

/** Стиль, гамма и настройки документа; карточку можно свернуть */
export const OfferPdfSettingsCard = () => {
    const card = useSettingsCard();
    return (
        <SectionCard
            title="Стиль и настройки"
            description={card.description}
            tone="complect"
            collapsible
            open={card.open}
            onOpenChange={card.setOpen}
        >
            <div className="flex flex-col gap-5">
                <OfferPdfCurrentStyle />
                <OfferPdfContentModes />
                <OfferPdfToggles />
                <OfferPdfTextFields />
            </div>
        </SectionCard>
    );
};
