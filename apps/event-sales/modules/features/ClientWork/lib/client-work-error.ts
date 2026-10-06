import {
    SLOW_SERVER_TEXT,
    isSlowServerError,
} from '@/modules/shared/lib/request-error';

/**
 * Человеческий текст ошибки запроса блока «Открытые сделки по клиенту».
 *
 * Nest отдаёт причину в `response.data.message` (403 «только руководитель»,
 * 400 «сделка уже закрыта — обновите список»); сетевые сбои внятного
 * текста не имеют — подставляем свой.
 */
export function toClientWorkErrorText(error: unknown): string {
    const message = (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message;
    if (typeof message === 'string' && message) return message;
    if (Array.isArray(message) && message.length) return message.join('; ');
    // Сообщение axios о таймауте — техническое, менеджеру его не показываем.
    if (isSlowServerError(error)) return SLOW_SERVER_TEXT;
    return error instanceof Error && error.message
        ? error.message
        : 'Не удалось выполнить запрос — повторите через минуту';
}
