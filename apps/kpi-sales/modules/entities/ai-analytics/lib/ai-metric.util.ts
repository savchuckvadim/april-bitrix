import type { AiMetric } from '../model';

/** Значение не показывается: доверие none (n < 8) или value = null. */
export const isAiMetricHidden = (
    metric: AiMetric | null | undefined,
): boolean =>
    !metric || metric.confidence.level === 'none' || metric.value === null;

/** Мало данных для выводов (8 ≤ n < 20): значение есть, но пунктиром. */
export const isAiMetricLow = (metric: AiMetric | null | undefined): boolean =>
    !!metric && metric.confidence.level === 'low' && metric.value !== null;

/** Доля 0.42 → «42 %»; null → «—». */
export const formatAiRate = (value: number | null | undefined): string =>
    value === null || value === undefined
        ? '—'
        : `${Math.round(value * 100).toLocaleString('ru-RU')} %`;

/** 90 %-й интервал [0.31, 0.55] → «31–55 %»; нет — пусто. */
export const formatAiCi90 = (ci90: number[] | undefined): string => {
    if (!ci90 || ci90.length < 2) return '';
    const [low, high] = ci90;
    if (low === undefined || high === undefined) return '';
    return `${Math.round(low * 100)}–${Math.round(high * 100)} %`;
};

/** Подпись бэйджа «мало данных (n = 7)». */
export const aiFewDataLabel = (n: number): string => `мало данных (n = ${n})`;

/** Причина пониженного доверия человеческим языком. */
export const aiConfidenceReasonLabel = (
    reason: string | undefined,
): string | null => {
    switch (reason) {
        case 'not-enough-data':
        case 'few-data':
            return 'недостаточно наблюдений';
        case 'version-changed':
            return 'сменилась версия разбора';
        case 'mixed-sources':
            return 'смешаны источники данных';
        default:
            return reason ?? null;
    }
};

/** Дата YYYY-MM-DD → «07.09»; пустая — «—». */
export const formatAiDay = (value: string | null | undefined): string => {
    if (!value) return '—';
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}.${month}` : value;
};

/** ISO-момент → «07.09 14:35» в локали браузера; пусто — «—». */
export const formatAiMoment = (value: string | null | undefined): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
