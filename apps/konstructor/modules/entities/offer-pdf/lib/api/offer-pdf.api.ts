import { customAxios } from '@workspace/nest-konstructor-api';
import type {
    OfferPdfGenerateRequest,
    OfferPdfGenerateResponse,
    OfferPdfTemplateInfo,
} from '../../model/types';

/**
 * Ручки offer-pdf бэка konstructor. Написаны руками, а не orval'ом:
 * клиент генерится с живого бэка, а PDF-ручки ещё не выложены. После
 * выкладки и `pnpm generate` в @workspace/nest-konstructor-api — заменить
 * на сгенерированные функции.
 */
export const offerPdfApi = {
    listTemplates: () =>
        customAxios<OfferPdfTemplateInfo[]>({
            url: '/api/offer-pdf/templates',
            method: 'GET',
        }),

    /** PDF целиком — для панели предпросмотра. */
    preview: (dto: OfferPdfGenerateRequest, signal?: AbortSignal) =>
        customAxios<Blob>({
            url: '/api/offer-pdf/preview',
            method: 'POST',
            data: dto,
            responseType: 'blob',
            signal,
        }),

    generate: (dto: OfferPdfGenerateRequest) =>
        customAxios<OfferPdfGenerateResponse>({
            url: '/api/offer-pdf/generate',
            method: 'POST',
            data: dto,
        }),
};

/**
 * Текст ошибки для пользователя. Ответ с ошибкой на blob-запрос приходит
 * тоже как Blob — читаем из него JSON бэка.
 */
export const readOfferPdfError = async (error: unknown): Promise<string> => {
    const fallback = 'Не удалось собрать PDF';
    if (!error || typeof error !== 'object') return fallback;
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (data instanceof Blob) {
        try {
            const parsed = JSON.parse(await data.text()) as { message?: string | string[] };
            const message = Array.isArray(parsed.message) ? parsed.message.join('; ') : parsed.message;
            if (message) return message;
        } catch {
            /* не JSON — ниже общий текст */
        }
    } else if (data && typeof data === 'object' && 'message' in data) {
        const message = (data as { message?: string | string[] }).message;
        if (Array.isArray(message)) return message.join('; ');
        if (message) return message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};
