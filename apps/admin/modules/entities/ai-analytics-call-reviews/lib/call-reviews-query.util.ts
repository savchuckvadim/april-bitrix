import {
    ANY_ITEM_KIND,
    type CallReviewsFilters,
    type CallReviewsPeriod,
    type CallReviewsQuery,
} from '../model';

const DAY_MS = 24 * 60 * 60 * 1000;
const MOSCOW = 'Europe/Moscow';

/** Дата → «YYYY-MM-DD» по Москве (границы дней бэк тоже берёт по Москве). */
export const moscowDay = (date: Date): string =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone: MOSCOW,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);

/** Строка — настоящая календарная дата YYYY-MM-DD (без 2026-02-30). */
export const isIsoDay = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

/** Последние `days` дней по Москве, сегодня включительно. */
export const defaultReviewsPeriod = (now: Date, days: number): CallReviewsPeriod => {
    const span = Math.max(1, Math.trunc(days));
    return {
        from: moscowDay(new Date(now.getTime() - (span - 1) * DAY_MS)),
        to: moscowDay(now),
    };
};

/** Обе даты валидны и начало не позже конца. */
export const isValidReviewsPeriod = (period: CallReviewsPeriod): boolean =>
    isIsoDay(period.from) && isIsoDay(period.to) && period.from <= period.to;

/**
 * Фильтры страницы → параметры ручки. Портал не выбран или период
 * неверный — null: запроса нет. «Все» и «любое» в запрос не попадают.
 */
export const toCallReviewsQuery = (
    filters: CallReviewsFilters,
    page: number,
    pageSize: number,
): CallReviewsQuery | null => {
    if (!filters.domain || !isValidReviewsPeriod(filters.period)) return null;
    return {
        domain: filters.domain,
        from: filters.period.from,
        to: filters.period.to,
        page: Math.max(1, Math.trunc(page)),
        pageSize,
        ...(filters.agree !== 'all' ? { agree: filters.agree } : {}),
        ...(filters.itemKind !== ANY_ITEM_KIND ? { itemKind: filters.itemKind } : {}),
    };
};
