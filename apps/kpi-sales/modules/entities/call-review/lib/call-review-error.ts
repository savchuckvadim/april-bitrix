/**
 * Текст ошибки ручек отзыва для человека. Бэк отвечает `{ resultCode,
 * message }` с понятным текстом (404 «Ссылка недействительна», 410 «Срок
 * ссылки истёк…», 403, 429) — его и показываем. Служебный текст
 * (валидация, латиница) заменяем запасным по статусу.
 */
import { isAiTechnicalErrorText } from '@/modules/entities/ai-analytics/lib/ai-error.util';
import { CALL_REVIEW_TEXT } from './call-review.texts';

const E = CALL_REVIEW_TEXT.errors;

const STATUS_TEXT: Readonly<Record<number, string>> = {
    403: E.forbidden,
    404: E.invalid,
    410: E.expired,
    413: E.tooLong,
    429: E.tooOften,
};

/** `message` из тела ответа: строка или массив строк. */
const messageOf = (payload: unknown): string | null => {
    if (typeof payload !== 'object' || payload === null || !('message' in payload)) {
        return null;
    }
    const message: unknown = payload.message;
    if (typeof message === 'string') return message.trim() || null;
    if (Array.isArray(message)) {
        const lines = message.filter(
            (line): line is string => typeof line === 'string' && line.trim() !== '',
        );
        return lines.length > 0 ? lines.join('; ') : null;
    }
    return null;
};

export function callReviewErrorText(
    payload: unknown,
    status: number | null,
    fallback: string = E.saveFailed,
): string {
    const server = messageOf(payload);
    if (server && !isAiTechnicalErrorText(server)) return server;
    return (status !== null ? STATUS_TEXT[status] : undefined) ?? fallback;
}
