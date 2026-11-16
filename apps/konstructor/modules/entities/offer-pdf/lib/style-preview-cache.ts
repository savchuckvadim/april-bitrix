import type { OfferPdfTemplateCode } from '../model/types';
import { offerPdfApi } from './api/offer-pdf.api';

/**
 * Миниатюры стилей на время вкладки (object URL первой страницы). Стили
 * меняются только выкладкой бэка — повторно за тем же стилем и гаммой не ходим.
 */
const cache = new Map<string, Promise<string>>();

const keyOf = (code: OfferPdfTemplateCode, palette: string | null): string => `${code}:${palette ?? ''}`;

export const getStylePreview = (code: OfferPdfTemplateCode, palette: string | null): Promise<string> => {
    const key = keyOf(code, palette);
    let entry = cache.get(key);
    if (!entry) {
        entry = offerPdfApi.stylePreview(code, palette).then(blob => URL.createObjectURL(blob));
        // неудача не кэшируется: следующий показ попробует снова
        entry.catch(() => cache.delete(key));
        cache.set(key, entry);
    }
    return entry;
};
