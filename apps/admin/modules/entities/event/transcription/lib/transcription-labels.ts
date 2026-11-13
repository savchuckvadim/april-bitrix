/**
 * Подписи списка транскрипций: распознаватель, статус, длительность —
 * по-русски, без кодов из базы. Неизвестное значение показывается как есть.
 */

const PROVIDER_LABELS: Readonly<Record<string, string>> = {
    yandex: 'Яндекс',
    'bitrix-vibecode': 'VibeCode',
    'local-whisper': 'Свой Whisper',
};

const STATUS_LABELS: Readonly<Record<string, string>> = {
    queued: 'В очереди',
    processing: 'Распознаётся',
    done: 'Готово',
    error: 'Ошибка',
};

/** Распознаватель по-русски: yandex → «Яндекс». */
export const transcriptionProviderLabel = (provider: string | null | undefined): string =>
    provider ? (PROVIDER_LABELS[provider] ?? provider) : '—';

/** Статус по-русски: done → «Готово». */
export const transcriptionStatusLabel = (status: string | null | undefined): string =>
    status ? (STATUS_LABELS[status] ?? status) : '—';

/** Длительность звонка «м:сс» или «ч:мм:сс»; неизвестна — «—». */
export function durationLabel(sec: number | null | undefined): string {
    if (sec === null || sec === undefined || !Number.isFinite(sec) || sec < 0) return '—';
    const total = Math.round(sec);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = String(total % 60).padStart(2, '0');
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
        : `${minutes}:${seconds}`;
}
