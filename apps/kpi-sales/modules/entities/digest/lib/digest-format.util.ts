import type { DigestMetricKind } from './digest-catalog';

/** Доля 0.84 → «84%»; null → «—». */
export const formatDigestPercent = (value: number | null | undefined): string =>
    value === null || value === undefined || Number.isNaN(value)
        ? '—'
        : `${Math.round(value * 100)}%`;

export const formatDigestNumber = (value: number | null | undefined): string =>
    value === null || value === undefined || Number.isNaN(value)
        ? '—'
        : Math.round(value).toLocaleString('ru-RU');

/** Значение метрики по её виду (счётчик / процент / минуты). */
export const formatDigestMetric = (
    value: number | null | undefined,
    kind: DigestMetricKind,
): string => {
    if (kind === 'percent') return formatDigestPercent(value);
    if (kind === 'minutes') {
        const text = formatDigestNumber(value);
        return text === '—' ? text : `${text} мин`;
    }
    return formatDigestNumber(value);
};

/** Среднее с одним знаком: 2.4 → «2,4». */
export const formatDigestAverage = (
    value: number | null | undefined,
    kind: DigestMetricKind,
): string => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    if (kind === 'percent') return formatDigestPercent(value);
    const rounded = Math.round(value * 10) / 10;
    const text = rounded.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
    return kind === 'minutes' ? `${text} мин` : text;
};

/** Дельта к среднему: +25% / −10%; null — нет базы. */
export const formatDigestDelta = (deltaPct: number | null): string => {
    if (deltaPct === null || Number.isNaN(deltaPct)) return '—';
    const rounded = Math.round(deltaPct);
    if (rounded === 0) return '0%';
    return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}%`;
};
