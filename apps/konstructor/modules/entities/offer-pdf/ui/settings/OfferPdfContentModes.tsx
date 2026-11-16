'use client';

import { SelectField } from '@workspace/april-ui/fields';
import { OFFER_PDF_DESCRIPTION_MODE_OPTIONS, OFFER_PDF_VIEW_MODE_OPTIONS } from '../../model/types';
import { useOfferPdfSettingsForm } from './hooks/use-offer-pdf-settings-form';

/** Сколько описания печатать и каким видом */
export const OfferPdfContentModes = () => {
    const { settings, setSetting } = useOfferPdfSettingsForm();
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
                id="offer-pdf-description"
                label="Описание наполнения"
                options={OFFER_PDF_DESCRIPTION_MODE_OPTIONS}
                value={settings.descriptionMode}
                onChange={value => setSetting('descriptionMode', value)}
            />
            <SelectField
                id="offer-pdf-view"
                label="Вид наполнения"
                options={OFFER_PDF_VIEW_MODE_OPTIONS}
                value={settings.viewMode}
                onChange={value => setSetting('viewMode', value)}
            />
        </div>
    );
};
