import type { Tone } from '@workspace/april-ui/tones';
import type { LogsFilter } from '../model';

/** Окна журналов: таблица хранит 30 дней. */
export const LOG_PERIODS: ReadonlyArray<{ hours: number; label: string }> = [
    { hours: 1, label: '1 час' },
    { hours: 6, label: '6 часов' },
    { hours: 24, label: 'Сутки' },
    { hours: 72, label: '3 дня' },
    { hours: 168, label: 'Неделя' },
    { hours: 720, label: '30 дней' },
];

/** Значение «все» для выпадающих списков: пустое значение Select не принимает. */
export const ALL = 'all';

/** Параметры запроса без пустых полей: пустая строка — «без условия». */
export const toLogsParams = (
    filter: LogsFilter,
): Record<string, string | number> => {
    const params: Record<string, string | number> = { hours: filter.hours };
    for (const key of ['app', 'env', 'level', 'domain', 'search'] as const) {
        const value = filter[key]?.trim();
        if (value && value !== ALL) params[key] = value;
    }
    return params;
};

export const levelTone = (level: string): Tone => {
    if (level === 'error') return 'destructive';
    if (level === 'warn') return 'warning';
    if (level === 'info') return 'info';
    return 'muted';
};

/** Время журнала (UTC) → местное «26.10, 18:04:05». Не дата — как есть. */
export const formatLogTime = (iso: string | null): string => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

/** Сравнение с прошлым окном: «+20», «−3», «=». */
export const formatDelta = (current: number, previous: number): string => {
    const delta = current - previous;
    if (delta === 0) return '=';
    return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
};
