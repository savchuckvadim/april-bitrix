import { getAppUrl } from '@/modules/app/lib/utills/url';

/**
 * Сообщить об ошибке фронта.
 *
 * Браузер стучится ТОЛЬКО на свой домен (`/api/front-error`) — из клиента не
 * видно ни бэка, ни Telegram, ни того, что тревога вообще куда-то уходит:
 * маршрут-прокси решает это на сервере. Поэтому здесь нет ни токенов, ни
 * адресов — и утечь из бандла нечему.
 *
 * `withTg` — «разбудить человека»: упавшее создание контакта — да, безобидный
 * сетевой чих — нет. Вызов никогда не кидает: падение отправки ошибки не
 * должно добивать сценарий, который и так упал.
 */
export interface FrontErrorInput {
    /** Где упало: `contact.create`, `contact.update`, `send.flow`, … */
    place: string;
    message: string;
    domain?: string | null;
    userId?: string | number | null;
    withTg?: boolean;
    /** Детали для разбора — без персональных данных клиента. */
    context?: Record<string, unknown>;
}

export const reportFrontError = (input: FrontErrorInput): void => {
    try {
        void fetch(getAppUrl('/api/front-error'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
            keepalive: true,
        }).catch(() => undefined);
    } catch {
        // Молчим намеренно: репортер не имеет права ронять приложение.
    }
};
