import { addDays, addMonths, format, isValid, parseISO } from 'date-fns';

/** Бэк принимает период обзора не длиннее трёх месяцев. */
export const AI_MAX_PERIOD_MONTHS = 3;

export interface AiPeriod {
    from: string;
    to: string;
    /** Начало сдвинуто вперёд, чтобы уложиться в лимит бэка. */
    clamped: boolean;
}

const DATE_FORMAT = 'yyyy-MM-dd';

const parseDay = (value: string): Date | null => {
    const date = parseISO(String(value).slice(0, 10));
    return isValid(date) ? date : null;
};

/**
 * Период обзора из глобального фильтра: даты YYYY-MM-DD, from ≤ to, длина
 * ≤ 3 мес. (иначе начало подтягивается к `to − 3 мес. + 1 день`). null —
 * даты не заданы или битые: запрос не отправляем.
 */
export const clampAiPeriod = (
    from: string | null | undefined,
    to: string | null | undefined,
): AiPeriod | null => {
    if (!from || !to) return null;
    const fromDate = parseDay(from);
    const toDate = parseDay(to);
    if (!fromDate || !toDate || fromDate > toDate) return null;

    const minFrom = addDays(addMonths(toDate, -AI_MAX_PERIOD_MONTHS), 1);
    const clamped = fromDate < minFrom;
    return {
        from: format(clamped ? minFrom : fromDate, DATE_FORMAT),
        to: format(toDate, DATE_FORMAT),
        clamped,
    };
};

/** Сегодня в формате бэка (для валидации `since` уровней). */
export const aiToday = (): string => format(new Date(), DATE_FORMAT);
