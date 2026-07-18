/** Утилиты форматирования для модулей маркетплейса. */

/** Дата-время в русской локали, «—» если пусто. */
export function formatDateTime(value?: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Обрезает строку до max символов с многоточием. */
export function truncate(value: string | undefined | null, max: number): string {
    if (!value) return '—';
    return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Достаёт человекочитаемое сообщение из ошибки запроса. */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return 'Неизвестная ошибка';
}

/** Истёк ли срок токена. */
export function isTokenExpired(tokenExpiresAt?: string | null): boolean {
    if (!tokenExpiresAt) return true;
    const date = new Date(tokenExpiresAt);
    if (Number.isNaN(date.getTime())) return true;
    return date.getTime() < Date.now();
}
