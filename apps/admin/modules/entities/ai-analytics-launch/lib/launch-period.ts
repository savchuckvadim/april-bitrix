import {
    LAUNCH_HISTORY_MONTHS,
    LAUNCH_REANALYSIS_FALLBACK_FROM,
} from '../consts/ai-analytics-launch.const';
import type { LaunchPeriod } from '../model';

/**
 * Периоды кнопок панели запуска считаются сами — владелец ничего не
 * вводит. Даты — по локальному времени браузера (владелец и порталы — в
 * одном поясе; конвейер всё равно пересчитает границы в поясе портала).
 */

const pad = (value: number): string => String(value).padStart(2, '0');

/** Сегодня 'YYYY-MM-DD'. */
export const todayKey = (now: Date): string =>
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** Месяц со сдвигом от месяца `now`: 0 — текущий, -1 — прошлый. */
export function shiftedMonthKey(now: Date, shift: number): string {
    const date = new Date(now.getFullYear(), now.getMonth() + shift, 1);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** Последний закрытый месяц — прошлый. */
export const lastClosedMonth = (now: Date): string => shiftedMonthKey(now, -1);

/** 24 закрытых месяца до прошлого включительно (лимит ручки backfill). */
export const historyRange = (now: Date): LaunchPeriod => ({
    from: shiftedMonthKey(now, -LAUNCH_HISTORY_MONTHS),
    to: lastClosedMonth(now),
});

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Период переразбора: с первого дня разборов на портале (или с
 * 21.07.2026, если даты нет) по сегодня; начало позже сегодня — один день.
 */
export function reanalysisPeriod(
    analysisSince: string | null | undefined,
    now: Date,
): LaunchPeriod {
    const to = todayKey(now);
    const since =
        analysisSince && DATE_KEY.test(analysisSince)
            ? analysisSince
            : LAUNCH_REANALYSIS_FALLBACK_FROM;
    return { from: since > to ? to : since, to };
}

const nextMonth = (monthKey: string): string => {
    const year = Number(monthKey.slice(0, 4));
    const month = Number(monthKey.slice(5, 7));
    return month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
};

/**
 * Закрытые месяцы периода дат (для пересборки витрины после переразбора):
 * от месяца начала до месяца конца, но не позже прошлого месяца — текущий
 * пересоберёт ночной прогон. null — закрытых месяцев в периоде нет.
 */
export function closedMonthsOf(
    period: LaunchPeriod,
    now: Date,
): LaunchPeriod | null {
    const from = period.from.slice(0, 7);
    const lastClosed = lastClosedMonth(now);
    const periodEnd = period.to.slice(0, 7);
    const to = periodEnd < lastClosed ? periodEnd : lastClosed;
    return from <= to ? { from, to } : null;
}

/** Сколько месяцев в периоде месяцев (включительно). */
export function monthCount(period: LaunchPeriod): number {
    let count = 0;
    for (
        let cursor = period.from;
        cursor <= period.to;
        cursor = nextMonth(cursor)
    ) {
        count += 1;
    }
    return count;
}
