import {
    DIGEST_CALLS_TOKENS,
    DIGEST_EVENT_STACKS,
    type HourBucket,
    type HourRange,
    hourLabel,
} from '@/modules/entities/digest';
import { resolveDigestToken } from '../../lib/digest-chart-colors';

/** Серия почасового графика: ключ в values корзины, подпись, цвет, ось. */
export interface TimelineSeries {
    key: string;
    label: string;
    color: string;
    /** Правая ось (вторая шкала — минуты эфира). */
    yAxisID?: 'y' | 'y1';
}

export type TimelineView = 'chart' | 'table';

export const TIMELINE_VIEW_OPTIONS = [
    { value: 'chart', label: 'График' },
    { value: 'table', label: 'Таблица' },
] as const;

export const eventSeries = (): TimelineSeries[] =>
    DIGEST_EVENT_STACKS.map(stack => ({
        key: stack.key,
        label: stack.label,
        color: resolveDigestToken(stack.token),
    }));

export const plannedSeries = (): TimelineSeries[] => [
    { key: 'calls', label: 'Звонки', color: resolveDigestToken('--digest-planned-at-start') },
    { key: 'presentations', label: 'Презентации', color: resolveDigestToken('--digest-postponed') },
    { key: 'other', label: 'Прочее', color: resolveDigestToken('--digest-expired') },
];

export const callsSeries = (): TimelineSeries[] => [
    { key: 'calls', label: 'Звонки', color: resolveDigestToken(DIGEST_CALLS_TOKENS.calls) },
    {
        key: 'minutes',
        label: 'Эфир, мин',
        color: resolveDigestToken(DIGEST_CALLS_TOKENS.airtime),
        yAxisID: 'y1',
    },
];

/** Корзины в видимом диапазоне часов. */
export const bucketsInRange = (buckets: readonly HourBucket[], range: HourRange): HourBucket[] =>
    buckets.filter(bucket => bucket.hour >= range.from && bucket.hour <= range.to);

export const hourLabels = (buckets: readonly HourBucket[]): string[] =>
    buckets.map(bucket => hourLabel(bucket.hour));

/** Серии, у которых есть хоть одно значение (пустые не рисуем и не выводим). */
export const nonEmptySeries = (
    series: readonly TimelineSeries[],
    buckets: readonly HourBucket[],
): TimelineSeries[] =>
    series.filter(item => buckets.some(bucket => (bucket.values[item.key] ?? 0) > 0));
