import { LAUNCH_TEXT } from '../consts/ai-analytics-launch.const';

/**
 * Ошибка нажатия человеческим текстом с кодом ответа. Бэк отвечает
 * `{ resultCode, message }`, а 400 валидации — `message: 'Validation failed'`
 * и текстами в `errors` (так глобальный фильтр ошибок оборачивает и
 * BadRequestException ручки stage-flags с понятным текстом про JSON).
 */

const VALIDATION_MESSAGE = 'Validation failed';

interface HttpLikeError {
    message?: unknown;
    code?: unknown;
    response?: { status?: unknown; data?: unknown };
}

const asText = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value.trim() : null;

function messageOf(data: unknown): string | null {
    if (typeof data === 'string') return asText(data);
    if (!data || typeof data !== 'object') return null;
    const body = data as { message?: unknown; errors?: unknown };
    const errors = Array.isArray(body.errors)
        ? body.errors.map(item => String(item)).filter(Boolean)
        : [];
    const message = asText(body.message);
    if (errors.length > 0 && (!message || message === VALIDATION_MESSAGE)) {
        return errors.join('; ');
    }
    if (Array.isArray(body.message)) return body.message.map(String).join('; ');
    return message;
}

export function describeLaunchError(error: unknown): string {
    if (!error || typeof error !== 'object') return LAUNCH_TEXT.errorTitle;
    const err = error as HttpLikeError;
    const status =
        typeof err.response?.status === 'number' ? err.response.status : null;
    if (status === null && err.code === 'ECONNABORTED') {
        return LAUNCH_TEXT.noResponse;
    }
    const text =
        messageOf(err.response?.data) ??
        asText(err.message) ??
        LAUNCH_TEXT.errorTitle;
    return status === null
        ? text
        : `${text} (${LAUNCH_TEXT.errorCode} ${status})`;
}
