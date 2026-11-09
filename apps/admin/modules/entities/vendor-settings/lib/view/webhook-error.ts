/**
 * Последняя ошибка доставки вебхука по ответу Telegram (getWebhookInfo):
 * когда была и актуальна ли. Telegram хранит последнюю ошибку, даже если
 * после неё всё доходит, — без даты разовый сбой (рестарт bot при деплое)
 * выглядит как авария.
 */

/** Ошибка старше часа при пустой очереди — уже не мешает. */
const STALE_AFTER_MS = 60 * 60 * 1000;

export interface WebhookErrorView {
    /** «09.11, 10:12» по времени браузера; null — даты нет. */
    at: string | null;
    /** Давно и очередь пуста: сейчас сообщения доходят. */
    stale: boolean;
}

export function webhookErrorView(
    lastErrorAt: string | null,
    pending: number,
    now: Date = new Date(),
): WebhookErrorView {
    const date = lastErrorAt ? new Date(lastErrorAt) : null;
    if (!date || Number.isNaN(date.getTime())) return { at: null, stale: false };
    const at = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
    return { at, stale: pending === 0 && now.getTime() - date.getTime() > STALE_AFTER_MS };
}
