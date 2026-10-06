import {
    SLOW_SERVER_TEXT,
    isSlowServerError,
} from '@/modules/shared/lib/request-error';

/**
 * Человеческий текст ошибки запроса.
 *
 * Nest отдаёт причину в `response.data.message`; всё остальное — сетевые сбои,
 * у которых внятного текста нет, поэтому подставляем свой. Таймаут — отдельно:
 * сообщение axios («timeout of 25000ms exceeded») менеджеру показывать нельзя.
 */
export function toErrorText(error: unknown): string {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
    if (message) return String(message);
    if (isSlowServerError(error)) return SLOW_SERVER_TEXT;
    return error instanceof Error ? error.message : 'Не удалось найти дубли';
}
