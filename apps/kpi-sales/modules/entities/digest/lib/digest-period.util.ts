import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Даты дайджеста: ISO YYYY-MM-DD без TZ-сдвигов (компоненты разбираются
 * руками, как в бэке), подписи дня по-русски.
 */

const pad = (value: number): string => String(value).padStart(2, '0');

/** Date (локальные компоненты) → YYYY-MM-DD. */
export const toIsoDay = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** YYYY-MM-DD → Date в локальной полуночи; невалидно → null. */
export const parseIsoDay = (iso: string): Date | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? '').trim());
    if (!match) return null;
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
};

export const todayIso = (now: Date = new Date()): string => toIsoDay(now);

/** Сдвиг дня на delta суток (отрицательный — назад). */
export const shiftIsoDay = (iso: string, delta: number): string => {
    const date = parseIsoDay(iso) ?? new Date();
    date.setDate(date.getDate() + delta);
    return toIsoDay(date);
};

export const isTodayIso = (iso: string, now: Date = new Date()): boolean =>
    iso === todayIso(now);

export const isFutureIso = (iso: string, now: Date = new Date()): boolean =>
    iso > todayIso(now);

/** «вт, 14 октября 2026» — подпись навигации по дням. */
export const formatDigestDay = (iso: string): string => {
    const date = parseIsoDay(iso);
    if (!date) return iso;
    return format(date, 'EEEEEE, d MMMM yyyy', { locale: ru });
};

/** «14.10.2026» — короткая подпись. */
export const formatDigestDayShort = (iso: string): string => {
    const date = parseIsoDay(iso);
    return date ? format(date, 'dd.MM.yyyy') : iso;
};

/** Час (0..23) из «YYYY-MM-DD HH:mm:ss»; null — нет времени. */
export const hourOfDateTime = (value: string | null | undefined): number | null => {
    const match = /^\d{4}-\d{2}-\d{2}[ T](\d{2}):/.exec(String(value ?? ''));
    if (!match) return null;
    const hour = Number(match[1]);
    return hour >= 0 && hour < 24 ? hour : null;
};

/** «10:15» из «YYYY-MM-DD HH:mm:ss». */
export const timeOfDateTime = (value: string | null | undefined): string => {
    const match = /^\d{4}-\d{2}-\d{2}[ T](\d{2}):(\d{2})/.exec(String(value ?? ''));
    return match ? `${match[1]}:${match[2]}` : '';
};

/** «14.10 10:15» — для дат вне текущего дня (дедлайны планов). */
export const formatDateTimeShort = (value: string | null | undefined): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(
        String(value ?? ''),
    );
    if (!match) return '';
    const [, , mm, dd, hh, mi] = match;
    return `${dd}.${mm} ${hh}:${mi}`;
};
