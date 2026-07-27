/**
 * Пересчёт плана под произвольный выбранный период отчёта.
 *
 * Руководитель задаёт значение на period-тип (месяц/квартал/год);
 * нормализуем к МЕСЯЧНОЙ ставке (/1,/3,/12), затем план на период =
 * Σ по календарным месяцам пересечения (частичный месяц — пропорционально
 * дням). «Ожидаемое сейчас» — доля прошедшего времени периода (риска
 * на прогресс-баре: где сотрудник должен быть при равномерном темпе).
 */
import {
    addMonths,
    differenceInCalendarDays,
    endOfMonth,
    getDaysInMonth,
    max as maxDate,
    min as minDate,
    startOfMonth,
} from 'date-fns';
import type { PlanPeriodType } from '../model';

/** Месяцев в периоде задания плана. */
const MONTHS_IN_PERIOD: Record<PlanPeriodType, number> = {
    month: 1,
    quarter: 3,
    year: 12,
};

/** Значение плана → месячная ставка. */
export const planMonthlyRate = (
    value: number,
    periodType: PlanPeriodType,
): number => value / MONTHS_IN_PERIOD[periodType];

/** Дней пересечения диапазона [from..to] с месяцем даты anchor (включительно). */
const overlapDaysInMonth = (anchor: Date, from: Date, to: Date): number => {
    const monthStart = startOfMonth(anchor);
    const monthEnd = endOfMonth(anchor);
    const start = maxDate([monthStart, from]);
    const end = minDate([monthEnd, to]);
    const days = differenceInCalendarDays(end, start) + 1;
    return days > 0 ? days : 0;
};

/**
 * План на диапазон отчёта [fromISO..toISO] (обе даты включительно):
 * Σ по месяцам пересечения (полный месяц = месячная ставка, частичный —
 * ставка × дни/днейМесяца). Невалидные даты → 0.
 */
export const planForRange = (
    value: number,
    periodType: PlanPeriodType,
    fromISO: string,
    toISO: string,
): number => {
    const from = new Date(fromISO);
    const to = new Date(toISO);
    if (
        Number.isNaN(from.getTime()) ||
        Number.isNaN(to.getTime()) ||
        from > to
    ) {
        return 0;
    }

    const monthly = planMonthlyRate(value, periodType);
    let total = 0;
    let cursor = startOfMonth(from);
    while (cursor <= to) {
        const overlap = overlapDaysInMonth(cursor, from, to);
        total += monthly * (overlap / getDaysInMonth(cursor));
        cursor = addMonths(cursor, 1);
    }
    return Math.round(total * 100) / 100;
};

/**
 * Доля прошедшего времени диапазона отчёта к «сейчас» (0..1):
 * период целиком в прошлом → 1, в будущем → 0. Для риски «где должен
 * быть сотрудник при равномерном темпе».
 */
export const expectedShare = (
    fromISO: string,
    toISO: string,
    now: Date = new Date(),
): number => {
    const from = new Date(fromISO);
    const to = new Date(toISO);
    if (
        Number.isNaN(from.getTime()) ||
        Number.isNaN(to.getTime()) ||
        from > to
    ) {
        return 0;
    }
    // Диапазон включает день to целиком.
    const totalDays = differenceInCalendarDays(to, from) + 1;
    const elapsedDays = differenceInCalendarDays(now, from);
    if (elapsedDays <= 0) return 0;
    if (elapsedDays >= totalDays) return 1;
    return elapsedDays / totalDays;
};
