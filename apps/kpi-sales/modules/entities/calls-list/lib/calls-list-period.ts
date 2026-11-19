/**
 * Период списка разборов: даты YYYY-MM-DD, период по умолчанию (последние
 * 30 дней) и проверка предела бэка (не длиннее 92 дней, начало не позже
 * конца). «Сегодня» приходит снаружи — функции чистые.
 */
import { addDays, differenceInCalendarDays, format, isValid, parse } from 'date-fns';
import type { CallsListPeriodProblem } from '../model/types';
import { CALLS_LIST_DEFAULT_DAYS, CALLS_LIST_MAX_DAYS } from './calls-list.const';

const DAY_FORMAT = 'yyyy-MM-dd';
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Дата → «2026-11-19» (по часам браузера). */
export const isoDay = (date: Date): string => format(date, DAY_FORMAT);

/** «2026-11-19» → дата; битая строка или несуществующий день — null. */
export function parseIsoDay(value: string | null | undefined): Date | null {
    if (!value || !DAY_PATTERN.test(value)) return null;
    const date = parse(value, DAY_FORMAT, new Date(2000, 0, 1));
    return isValid(date) && isoDay(date) === value ? date : null;
}

/** Последние 30 дней, включая сегодня. */
export function defaultCallsListPeriod(today: Date): { from: string; to: string } {
    return {
        from: isoDay(addDays(today, -(CALLS_LIST_DEFAULT_DAYS - 1))),
        to: isoDay(today),
    };
}

/** Длина периода в днях, обе даты включительно; даты битые — null. */
export function callsListPeriodDays(from: string, to: string): number | null {
    const start = parseIsoDay(from);
    const end = parseIsoDay(to);
    if (!start || !end) return null;
    return differenceInCalendarDays(end, start) + 1;
}

/** Что не так с периодом; всё в порядке — null (запрос можно слать). */
export function callsListPeriodProblem(
    from: string,
    to: string,
): CallsListPeriodProblem | null {
    const days = callsListPeriodDays(from, to);
    if (days === null) return 'invalid';
    if (days < 1) return 'order';
    return days > CALLS_LIST_MAX_DAYS ? 'too_long' : null;
}
