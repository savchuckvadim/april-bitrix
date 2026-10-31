'use client';

import { ChoiceChips } from '@workspace/april-ui/fields';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { OFFER_DOCUMENT_FORMAT, type OfferDocumentFormat } from '../model/types';
import { useOfferPdfDocument } from '../model/OfferPdfDocumentContext';

const OPTIONS = [
    { value: OFFER_DOCUMENT_FORMAT.WORD, label: 'По Word-шаблону' },
    { value: OFFER_DOCUMENT_FORMAT.PDF, label: 'PDF из встроенного шаблона' },
];

const DESCRIPTIONS: Record<OfferDocumentFormat, string> = {
    word: 'Ваш шаблон Word: документ собирается в очереди и приходит в сделку вместе со счётом.',
    pdf: 'Готовый шаблон в приложении: PDF собирается за секунду, превью обновляется само. Счёт в этом режиме не формируется.',
};

/** Переключатель: КП по Word-шаблону пользователя или PDF из встроенного. */
export const OfferDocumentFormatSwitch = () => {
    const { format, setFormat } = useOfferPdfDocument();

    return (
        <SectionCard title="Как собрать КП" description={DESCRIPTIONS[format]} tone="complect" density="compact">
            <ChoiceChips
                options={OPTIONS}
                value={format}
                onChange={value => setFormat(value as OfferDocumentFormat)}
                ariaLabel="Формат коммерческого предложения"
            />
        </SectionCard>
    );
};
