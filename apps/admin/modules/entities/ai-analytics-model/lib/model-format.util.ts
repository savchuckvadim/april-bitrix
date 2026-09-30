/**
 * Форматирование чисел раздела «Модель и обратная связь» по-русски:
 * запятая в дробях, неразрывный пробел в разрядах и перед «%».
 * null / нечисло — прочерк: «не посчитано» не равно нулю.
 */

export const NO_VALUE = '—';

const NBSP = String.fromCharCode(0xa0);

const MONTH_NAMES = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
] as const;

const isFiniteNumber = (value: number | null | undefined): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const fixed = (value: number, digits: number): string =>
    new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(value);

/** Целое с разрядами: 12345 → «12 345». */
export const formatCount = (value: number | null | undefined): string =>
    isFiniteNumber(value) ? fixed(Math.round(value), 0) : NO_VALUE;

/** Дробное с фиксированным числом знаков: 0.4213 → «0,42». */
export const formatDecimal = (
    value: number | null | undefined,
    digits = 2,
): string => (isFiniteNumber(value) ? fixed(value, digits) : NO_VALUE);

/** Доля 0–1 в процентах: 0.873 → «87 %». */
export const formatShare = (
    value: number | null | undefined,
    digits = 0,
): string =>
    isFiniteNumber(value) ? `${fixed(value * 100, digits)}${NBSP}%` : NO_VALUE;

/** Значение, уже выраженное в процентах: 62.5 → «62,5 %». */
export const formatPercent = (
    value: number | null | undefined,
    digits = 1,
): string =>
    isFiniteNumber(value) ? `${fixed(value, digits)}${NBSP}%` : NO_VALUE;

/**
 * Разность со знаком: 0.05 → «+0,05», −0.03 → «−0,03». Если после
 * округления остаётся ноль — без знака: «+0,00» читается как рост.
 */
export const formatSigned = (
    value: number | null | undefined,
    digits = 2,
): string => {
    if (!isFiniteNumber(value)) return NO_VALUE;
    const factor = 10 ** digits;
    const rounded = Math.round(Math.abs(value) * factor) / factor;
    const body = fixed(rounded, digits);
    if (rounded === 0) return body;
    return value > 0 ? `+${body}` : `−${body}`;
};

/** Интервал [нижняя, верхняя] → «0,12 – 0,48»; кривой интервал — прочерк. */
export const formatRange = (
    range: readonly number[] | null | undefined,
    format: (value: number) => string,
): string => {
    if (!range || range.length !== 2) return NO_VALUE;
    const [low, high] = range;
    if (!isFiniteNumber(low) || !isFiniteNumber(high)) return NO_VALUE;
    return `${format(low)} – ${format(high)}`;
};

/** Оценка с интервалом: «0,31 (0,12 – 0,48)»; без интервала — только оценка. */
export const formatWithRange = (
    value: number | null | undefined,
    range: readonly number[] | null | undefined,
    format: (value: number) => string,
): string => {
    if (!isFiniteNumber(value)) return NO_VALUE;
    const interval = formatRange(range, format);
    return interval === NO_VALUE
        ? format(value)
        : `${format(value)} (${interval})`;
};

/** «2 из 3». */
export const formatOutOf = (part: number, total: number): string =>
    `${formatCount(part)} из ${formatCount(total)}`;

/** Ключ месяца «2026-09» → «сентябрь 2026»; чужой формы — как есть. */
export const formatMonthKey = (monthKey: string): string => {
    const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
    if (!match) return monthKey;
    const name = MONTH_NAMES[Number(match[2]) - 1];
    return name ? `${name} ${match[1]}` : monthKey;
};

/** Дата «2026-09-01» → «01.09.2026»; чужой формы — как есть. */
export const formatDay = (day: string): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : day;
};

/** Момент ISO → дата и время в поясе браузера; пусто — прочерк. */
export const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return NO_VALUE;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Форма слова после числа: 1 месяц, 2 месяца, 5 месяцев.
 * `forms` — [одна, две-четыре, пять].
 */
export const pluralRu = (
    count: number,
    forms: readonly [string, string, string],
): string => {
    const abs = Math.abs(Math.trunc(count));
    const lastTwo = abs % 100;
    const last = abs % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
    if (last === 1) return forms[0];
    if (last >= 2 && last <= 4) return forms[1];
    return forms[2];
};
