import { isAxiosError } from 'axios';
import { SITE_MEDIA_MAX_BYTES } from '@workspace/site-media';

const MB = 1024 * 1024;
const FALLBACK = 'Не удалось сохранить файл';

/** Общий заголовок фильтра ошибок бэка для любого 400 — сам по себе ничего не объясняет. */
const GENERIC_VALIDATION_MESSAGE = 'Validation failed';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/**
 * Текст бэка из конверта ошибки: у 400 причина лежит в `errors`, а `message`
 * там всегда «Validation failed»; у 404 и 413 причина — в `message`.
 */
const backMessage = (data: unknown): string | null => {
    if (!isRecord(data)) return null;
    const { errors, message } = data;
    const reasons = (Array.isArray(errors) ? errors : [errors]).filter(
        (reason): reason is string => typeof reason === 'string' && reason.trim() !== '',
    );
    if (reasons.length > 0) return reasons.join('. ');
    if (typeof message === 'string' && message.trim() && message !== GENERIC_VALIDATION_MESSAGE) {
        return message;
    }
    return null;
};

/**
 * Понятная причина отказа загрузки. Сервер объясняет по-русски, кроме двух
 * случаев: тело больше лимита (413 от multer или nginx) и обрыв по таймауту —
 * их переводим здесь.
 */
export function siteMediaErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        if (error.response?.status === 413) {
            return `Файл больше, чем принимает сервер: картинка — до ${SITE_MEDIA_MAX_BYTES.image / MB} МБ, видео — до ${SITE_MEDIA_MAX_BYTES.video / MB} МБ`;
        }
        if (error.code === 'ECONNABORTED') {
            return 'Загрузка не уложилась по времени — проверьте связь или сожмите файл';
        }
        return backMessage(error.response?.data) ?? FALLBACK;
    }
    return error instanceof Error && error.message ? error.message : FALLBACK;
}
