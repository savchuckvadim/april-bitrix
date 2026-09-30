/** Период сводки обратной связи: даты YYYY-MM-DD включительно (UTC). */
export interface FeedbackPeriod {
    from: string;
    to: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Дата → «YYYY-MM-DD» по UTC (границы сводки бэк тоже берёт по UTC). */
export const toIsoDay = (date: Date): string => date.toISOString().slice(0, 10);

/** Строка — настоящая календарная дата YYYY-MM-DD (без 2026-02-30). */
export const isIsoDay = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && toIsoDay(date) === value;
};

/** Последние `days` дней, сегодня включительно. */
export const defaultFeedbackPeriod = (now: Date, days: number): FeedbackPeriod => {
    const span = Math.max(1, Math.trunc(days));
    return {
        from: toIsoDay(new Date(now.getTime() - (span - 1) * DAY_MS)),
        to: toIsoDay(now),
    };
};

/** Обе даты валидны и начало не позже конца. */
export const isValidFeedbackPeriod = (period: FeedbackPeriod): boolean =>
    isIsoDay(period.from) && isIsoDay(period.to) && period.from <= period.to;
