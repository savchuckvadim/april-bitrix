/**
 * Форматирование страницы звонка: время в записи, длительность, дата.
 * Дата — по Москве с пометкой: страницу открывают без входа, и часовой пояс
 * сервера и браузера не должен менять текст (иначе расходится разметка).
 */

/** Секунда записи «1:34»; час и больше — «1:02:03». */
export function formatClock(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
        return '';
    }
    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const rest = String(total % 60).padStart(2, '0');
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}`
        : `${minutes}:${rest}`;
}

/** Длительность словами: «6 мин 52 с», «45 с»; нет данных — null. */
export function formatDuration(seconds: number | null | undefined): string | null {
    if (seconds === null || seconds === undefined || seconds <= 0) return null;
    const total = Math.round(seconds);
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    if (minutes === 0) return `${rest} с`;
    return rest === 0 ? `${minutes} мин` : `${minutes} мин ${rest} с`;
}

const CALL_DATE = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

/** «12 ноября 2026 г. в 12:41 МСК»; нет даты или она битая — null. */
export function formatCallDate(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return `${CALL_DATE.format(date)} МСК`;
}

/** Оценка «6,4»; нет оценки — «—». */
export const formatScore = (value: number | null | undefined): string =>
    value === null || value === undefined
        ? '—'
        : value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
