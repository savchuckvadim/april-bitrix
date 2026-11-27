import type { OfferPdfSettings, OfferPdfTemplateInfo } from '../model/types';

type OfferPdfToggleKey = {
    [K in keyof OfferPdfSettings]: OfferPdfSettings[K] extends boolean ? K : never;
}[keyof OfferPdfSettings];

export interface OfferPdfToggle {
    key: OfferPdfToggleKey;
    label: string;
    hint: string;
    /** Переключатель есть только у стилей с такой страницей */
    onlyIf?: 'hasCover' | 'hasPromo';
    /** Блок стоит под письмом: без письма не печатается, переключатель закрыт */
    needsLetter?: boolean;
}

/** Подпись под переключателем, когда блок под письмом закрыт выключенным письмом */
export const OFFER_PDF_NO_LETTER_HINT = 'Стоит под письмом: без письма не печатается';

/** Переключатели в порядке страниц документа */
export const OFFER_PDF_TOGGLES: readonly OfferPdfToggle[] = [
    { key: 'withCover', label: 'Титульный лист', hint: 'Первая страница с названием', onlyIf: 'hasCover' },
    { key: 'withPromo', label: 'Промо-страница', hint: 'О продукте, после титульного', onlyIf: 'hasPromo' },
    {
        key: 'withStamps',
        label: 'Печать и подпись',
        hint: 'Блок под письмом: должность, подпись и печать поставщика',
        needsLetter: true,
    },
    { key: 'withManager', label: 'Контакты менеджера', hint: 'В подвале каждой страницы' },
    { key: 'isPriceFirst', label: 'Сначала цена', hint: 'Потом наполнение' },
];

/** Переключатель закрыт: блок стоит под письмом, а письмо выключено */
export const isOfferPdfToggleDisabled = (
    toggle: OfferPdfToggle,
    settings: Pick<OfferPdfSettings, 'withLetter'>,
): boolean => Boolean(toggle.needsLetter) && !settings.withLetter;

/** Переключатели выбранного стиля: страниц, которых у него нет, не показываем */
export const visibleOfferPdfToggles = (template: OfferPdfTemplateInfo | null): OfferPdfToggle[] =>
    OFFER_PDF_TOGGLES.filter(toggle => !toggle.onlyIf || template?.[toggle.onlyIf] === true);
