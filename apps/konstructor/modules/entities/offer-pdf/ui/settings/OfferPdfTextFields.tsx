'use client';

import { BlurCommitInput } from '@workspace/april-ui/fields';
import { Label } from '@workspace/ui/components/label';
import { useOfferPdfSettingsForm } from './hooks/use-offer-pdf-settings-form';

/** Фраза об акции и исходящий номер */
export const OfferPdfTextFields = () => {
    const { settings, setSetting, documentNumber, setDocumentNumber } = useOfferPdfSettingsForm();
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="offer-pdf-sale-phrase">Фраза об акции</Label>
                <BlurCommitInput
                    id="offer-pdf-sale-phrase"
                    value={settings.salePhrase}
                    onCommit={value => setSetting('salePhrase', value)}
                    placeholder="Печатается под таблицей цен"
                    maxLength={500}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="offer-pdf-number">Исходящий номер</Label>
                <BlurCommitInput
                    id="offer-pdf-number"
                    value={documentNumber}
                    onCommit={setDocumentNumber}
                    placeholder="Пусто — печатается только дата"
                    maxLength={50}
                />
            </div>
        </div>
    );
};
