/**
 * Extract a human-readable message from a failed pbx-install request. The backend
 * surfaces failures as `{ resultCode, message }` (e.g. a 500 with
 * "В битриксе не удалось изменить ни одного поля смарта"); axios wraps that under
 * `error.response.data`. Falls back to NestJS `message` arrays, the axios error
 * message, then a generic label.
 */
export function getApiErrorMessage(
    error: unknown,
    fallback = 'Не удалось выполнить операцию',
): string {
    if (error && typeof error === 'object') {
        const err = error as {
            response?: { data?: unknown };
            message?: string;
        };
        const data = err.response?.data;

        if (typeof data === 'string' && data.trim()) return data;
        if (data && typeof data === 'object') {
            const d = data as Record<string, unknown>;
            const msg = d.message ?? d.error;
            if (typeof msg === 'string' && msg.trim()) return msg;
            if (Array.isArray(msg) && msg.length) return msg.map(String).join('; ');
        }
        if (typeof err.message === 'string' && err.message.trim()) return err.message;
    }
    return fallback;
}
