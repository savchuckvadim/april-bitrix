import { isAxiosError } from 'axios';
import {
    PROVIDER_IMAGE_CHECK_TEXT,
    PROVIDER_IMAGE_MAX_BYTES,
} from '../model';
import { formatFileSize } from './provider-image-file.util';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const nonEmptyString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() !== '' ? value : null;

/**
 * Текст бэка из конверта ошибки. У 400 причина лежит в `errors[0]`
 * (`message` там всегда «Validation failed»), у 404 — в `message`.
 */
export function backErrorMessage(data: unknown): string | null {
    if (!isRecord(data)) return null;
    const { errors, message } = data;
    if (Array.isArray(errors)) {
        const first = errors.map(nonEmptyString).find((reason) => reason !== null);
        if (first) return first;
    }
    return nonEmptyString(message);
}

/**
 * Причина отказа для пользователя. Бэк объясняет по-русски; отдельно
 * переводим тело больше лимита (413 от nginx) и обрыв по таймауту.
 */
export function providerImageErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError(error)) {
        if (error.response?.status === 413) {
            return PROVIDER_IMAGE_CHECK_TEXT.serverTooLarge(
                formatFileSize(PROVIDER_IMAGE_MAX_BYTES),
            );
        }
        if (error.code === 'ECONNABORTED') return PROVIDER_IMAGE_CHECK_TEXT.timeout;
        return backErrorMessage(error.response?.data) ?? fallback;
    }
    return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * До применения миграции на проде ручки картинок отвечают 500: раздел
 * показывает спокойное сообщение вместо ошибки.
 */
export function isProviderImagesUnavailable(error: unknown): boolean {
    return isAxiosError(error) && error.response?.status === 500;
}
