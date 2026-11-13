/**
 * Форматирование расхода на распознавание: рубли, минуты, месяцы и
 * сравнение с прошлым месяцем. Месяц — по Москве, как считает сервер.
 */

const MONTHS = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
] as const;

const MONTHS_DATIVE = [
    'январю', 'февралю', 'марту', 'апрелю', 'маю', 'июню',
    'июлю', 'августу', 'сентябрю', 'октябрю', 'ноябрю', 'декабрю',
] as const;

const MOSCOW_OFFSET_MS = 3 * 3_600_000;

const parseMonth = (month: string): { year: number; index: number } | null => {
    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
    return match ? { year: Number(match[1]), index: Number(match[2]) - 1 } : null;
};

/** Текущий месяц по Москве: YYYY-MM. */
export function currentMoscowMonth(now: Date = new Date()): string {
    const moscow = new Date(now.getTime() + MOSCOW_OFFSET_MS);
    return `${moscow.getUTCFullYear()}-${String(moscow.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Месяц со сдвигом: shiftMonth('2026-01', -1) → '2025-12'. */
export function shiftMonth(month: string, shift: number): string {
    const parsed = parseMonth(month);
    if (!parsed) return month;
    const total = parsed.year * 12 + parsed.index + shift;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** «ноябрь 2026». */
export function monthLabel(month: string): string {
    const parsed = parseMonth(month);
    return parsed ? `${MONTHS[parsed.index]} ${parsed.year}` : month;
}

/** «к октябрю» — для сравнения с предыдущим месяцем. */
export function previousMonthDative(month: string): string {
    const parsed = parseMonth(shiftMonth(month, -1));
    return parsed ? `к ${MONTHS_DATIVE[parsed.index]}` : '';
}

/** «3 198,72 ₽»; целые рубли — без копеек. */
export function rubLabel(rub: number): string {
    const fraction = Number.isInteger(rub) ? 0 : 2;
    return `${rub.toLocaleString('ru-RU', {
        minimumFractionDigits: fraction,
        maximumFractionDigits: 2,
    })} ₽`;
}

/** «5 320 мин»; до десяти — с десятыми: «2,5 мин». */
export function minutesLabel(minutes: number): string {
    const digits = minutes < 10 && !Number.isInteger(minutes) ? 1 : 0;
    return `${minutes.toLocaleString('ru-RU', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })} мин`;
}

/**
 * Изменение к прошлому месяцу: «+12 %», «−40 %»; прошлого нет — null
 * (сравнивать не с чем).
 */
export function changeLabel(current: number, previous: number): string | null {
    if (previous <= 0) return null;
    const percent = Math.round(((current - previous) / previous) * 100);
    if (percent === 0) return 'как в прошлом месяце';
    return `${percent > 0 ? '+' : '−'}${Math.abs(percent)} %`;
}

/** День по Москве «12.11» из YYYY-MM-DD. */
export function dayLabel(day: string): string {
    const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(day);
    return match ? `${match[2]}.${match[1]}` : day;
}
