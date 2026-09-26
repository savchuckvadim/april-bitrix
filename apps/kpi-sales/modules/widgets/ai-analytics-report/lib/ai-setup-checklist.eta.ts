import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    format,
    isValid,
    parseISO,
    setDate,
    startOfMonth,
} from 'date-fns';
import type { AiChecklistEta } from './ai-setup-checklist.types';

/*
 * Сроки чек-листа: ближайший слот расписания (1-е / 3-е число), дата через
 * N месяцев, недели с даты сопоставимости. Даты — YYYY-MM-DD.
 */

const DATE_FORMAT = 'yyyy-MM-dd';

/** Дней в среднем месяце — как у бэка (readiness.util MS_PER_MONTH). */
export const AI_DAYS_PER_MONTH = 30.44;

const DAYS_PER_WEEK = 7;

const parseDay = (value: string | null | undefined): Date | null => {
    if (!value) return null;
    const date = parseISO(value.slice(0, 10));
    return isValid(date) ? date : null;
};

/**
 * Ближайшее число `day` после сегодня: сегодня раньше — в этом месяце,
 * иначе в следующем (слот уже прошёл или идёт сегодня).
 */
export const aiNextMonthDay = (today: string, day: number): string | null => {
    const date = parseDay(today);
    if (!date) return null;
    const slot = setDate(startOfMonth(date), day);
    return format(
        date.getDate() < day ? slot : addMonths(slot, 1),
        DATE_FORMAT,
    );
};

/** Дата через `days` дней; битая дата — null. */
export const aiAddDaysIso = (value: string, days: number): string | null => {
    const date = parseDay(value);
    return date && Number.isFinite(days)
        ? format(addDays(date, Math.ceil(days)), DATE_FORMAT)
        : null;
};

/** Дата через `months` месяцев (дробные — по 30,44 дня); отрицательные — null. */
export const aiAddMonthsIso = (today: string, months: number): string | null =>
    Number.isFinite(months) && months >= 0
        ? aiAddDaysIso(today, months * AI_DAYS_PER_MONTH)
        : null;

/** Полных недель от даты до сегодня (не меньше 0); битая дата — null. */
export const aiWeeksSince = (from: string, today: string): number | null => {
    const start = parseDay(from);
    const end = parseDay(today);
    if (!start || !end) return null;
    return Math.max(
        0,
        Math.floor(differenceInCalendarDays(end, start) / DAYS_PER_WEEK),
    );
};

/** Срок по расписанию крона: дата и время слота. */
export const aiScheduledEta = (
    date: string | null,
    time: string,
): AiChecklistEta | null => (date ? { date, rough: false, time } : null);

/** Примерный срок (оценка, а не слот расписания): без времени. */
export const aiRoughEta = (date: string | null): AiChecklistEta | null =>
    date ? { date, rough: true, time: null } : null;
