import { differenceInCalendarDays, format, subDays, subYears } from 'date-fns';

export type ComparisonMode = 'off' | 'prev' | 'yoy';

export const COMPARISON_MODE_LABELS: Record<ComparisonMode, string> = {
    off: 'Без сравнения',
    prev: 'Прошлый период',
    yoy: 'Год к году',
};

const toDateOnly = (value: Date): string => format(value, 'yyyy-MM-dd');

/**
 * Период сравнения: prev — той же (инклюзивной) длины непосредственно
 * перед текущим; yoy — те же даты годом раньше.
 */
export const shiftPeriod = (
    from: string,
    to: string,
    mode: Exclude<ComparisonMode, 'off'>,
): { from: string; to: string } => {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (mode === 'yoy') {
        return {
            from: toDateOnly(subYears(fromDate, 1)),
            to: toDateOnly(subYears(toDate, 1)),
        };
    }

    const lengthDays = differenceInCalendarDays(toDate, fromDate) + 1;
    return {
        from: toDateOnly(subDays(fromDate, lengthDays)),
        to: toDateOnly(subDays(toDate, lengthDays)),
    };
};
