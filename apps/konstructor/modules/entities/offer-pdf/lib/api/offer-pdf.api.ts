import { customAxios, getKonstructor } from '@workspace/nest-konstructor-api';
import type {
    OfferPdfGenerateRequest,
    OfferPdfGenerateResponse,
    OfferPdfTemplateCode,
    OfferPdfTemplateInfo,
} from '../../model/types';

const api = getKonstructor();

/**
 * Ручки offer-pdf бэка konstructor — единственное место импорта api-пакета в
 * слайсе. Сгенерированные функции, кроме предпросмотра: см. `preview`.
 */
export const offerPdfApi = {
    listTemplates: (): Promise<OfferPdfTemplateInfo[]> => api.offerPdfListTemplates(),

    /**
     * PDF целиком — для панели предпросмотра. Запрос написан руками:
     * сгенерированной функции некуда передать `signal`, а превью отменяет
     * устаревший запрос, когда менеджер правит дальше.
     */
    preview: (dto: OfferPdfGenerateRequest, signal?: AbortSignal) =>
        customAxios<Blob>({
            url: '/api/offer-pdf/preview',
            method: 'POST',
            data: dto,
            responseType: 'blob',
            signal,
        }),

    generate: (dto: OfferPdfGenerateRequest): Promise<OfferPdfGenerateResponse> =>
        api.offerPdfGenerate(dto),

    /** Первая страница стиля на образце «Гарант-Офис» — миниатюра для выбора. */
    stylePreview: (code: OfferPdfTemplateCode, palette: string | null): Promise<Blob> =>
        api.offerPdfStylePreview(code, palette ? { palette } : undefined),
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
