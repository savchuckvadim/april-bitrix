import type { OfferPdfTemplateInfo } from '../model/types';
import { offerPdfApi } from './api/offer-pdf.api';

/**
 * Список стилей на время вкладки: меняется только выкладкой бэка, а нужен
 * и экрану КП, и витрине стилей — второй раз за ним не ходим.
 */
let cache: Promise<OfferPdfTemplateInfo[]> | null = null;

export const getOfferPdfTemplates = (): Promise<OfferPdfTemplateInfo[]> => {
    if (!cache) {
        const request = offerPdfApi.listTemplates();
        // неудача не кэшируется: следующий заход попробует снова
        request.catch(() => {
            if (cache === request) cache = null;
        });
        cache = request;
    }
    return cache;
};
