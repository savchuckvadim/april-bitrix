/*
 * Единственный форматтер дат и ключей периодов витрины — по-человечески:
 * день «2026-09-07» → «07.09.2026», месяц «YYYY-MM» → «сентябрь 2026»
 * (или «сентября 2026» после «против»), ISO-неделя «YYYY-Www» →
 * «27.07–02.08». Сырые ключи на экран не выводим; битый ключ — прочерк
 * (или null там, где вызывающий код опускает фрагмент). Досье, стиль,
 * тренды, «год назад» и «Как считаем» ходят сюда — своих копий нет.
 */

const RU_MONTHS = [
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

const RU_MONTHS_GENITIVE = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
] as const;

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})/;
const MONTH_KEY = /^(\d{4})-(\d{2})$/;
const WEEK_KEY = /^(\d{4})-W(\d{2})$/;
/** 4 января всегда в первой ISO-неделе года. */
const ISO_ANCHOR_DAY = 4;
const DAYS_IN_WEEK = 7;
const MS_PER_DAY = 86_400_000;

/** Пусто или ключ не разобран — прочерк, а не сырое значение. */
export const AI_PERIOD_UNKNOWN = '—';
/** То же под именем для дат (досье, настройки, «Как считаем»). */
export const AI_DATE_EMPTY = AI_PERIOD_UNKNOWN;

/* ---------- День ---------- */

/** Дата YYYY-MM-DD (или ISO-момент) → «07.09.2026»; пусто или не дата — «—». */
export const formatAiFullDate = (value: string | null | undefined): string => {
    const match = value ? DATE_KEY.exec(value) : null;
    return match ? `${match[3]}.${match[2]}.${match[1]}` : AI_DATE_EMPTY;
};

/* ---------- Месяц ---------- */

interface MonthKeyParts {
    year: number;
    month: number;
}

const parseMonthKey = (key: string): MonthKeyParts | null => {
    const match = MONTH_KEY.exec(key);
    if (!match) return null;
    const month = Number(match[2]);
    return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : null;
};

export interface AiMonthLabelOptions {
    /** Родительный падеж: «сентября 2026» (после «против», «с»). */
    genitive?: boolean;
    /** Без года: «сентябрь». */
    withoutYear?: boolean;
}

/** «2026-09» → «сентябрь 2026»; битый ключ — прочерк. */
export const formatAiMonthLabel = (
    key: string,
    { genitive = false, withoutYear = false }: AiMonthLabelOptions = {},
): string => {
    const parts = parseMonthKey(key);
    if (!parts) return AI_PERIOD_UNKNOWN;
    const name = (genitive ? RU_MONTHS_GENITIVE : RU_MONTHS)[parts.month - 1];
    return withoutYear ? `${name}` : `${name} ${parts.year}`;
};

/** Ключ месяца, который может не прийти: пусто — прочерк. */
export const formatAiMonthKey = (value: string | null | undefined): string =>
    formatAiMonthLabel(value ?? '');

/** Родительный падеж для «против сентября 2025»; пусто или не ключ — «—». */
export const formatAiMonthKeyGenitive = (
    value: string | null | undefined,
): string => formatAiMonthLabel(value ?? '', { genitive: true });

/** «2026-06» – «2026-08» → «июнь – август 2026»; разные годы — оба с годом. */
export const formatAiMonthLabelRange = (from: string, to: string): string => {
    const start = parseMonthKey(from);
    const end = parseMonthKey(to);
    if (!start || !end) return AI_PERIOD_UNKNOWN;
    const sameYear = start.year === end.year;
    return `${formatAiMonthLabel(from, { withoutYear: sameYear })} – ${formatAiMonthLabel(to)}`;
};

/** Месяцы по возрастанию → «июль – сентябрь 2026»; один — он сам; пусто — «—». */
export const formatAiMonthRange = (months: readonly string[]): string => {
    const first = months[0];
    if (first === undefined) return AI_PERIOD_UNKNOWN;
    const last = months[months.length - 1] ?? first;
    return first === last
        ? formatAiMonthKey(first)
        : formatAiMonthLabelRange(first, last);
};

/* ---------- ISO-неделя ---------- */

/** Понедельник ISO-недели в UTC; битый ключ или номер вне года — null. */
export const aiIsoWeekMondayUtc = (weekKey: string): Date | null => {
    const match = WEEK_KEY.exec(weekKey);
    if (!match) return null;
    const year = Number(match[1]);
    const week = Number(match[2]);
    if (week < 1) return null;
    const anchor = Date.UTC(year, 0, ISO_ANCHOR_DAY);
    // getUTCDay: 0 — воскресенье; понедельник первой недели — сдвиг назад.
    const anchorWeekday = (new Date(anchor).getUTCDay() + 6) % DAYS_IN_WEEK;
    const monday =
        anchor - anchorWeekday * MS_PER_DAY + (week - 1) * DAYS_IN_WEEK * MS_PER_DAY;
    // Четверг недели определяет её ISO-год: номер вне года — битый ключ.
    const thursday = new Date(monday + 3 * MS_PER_DAY);
    return thursday.getUTCFullYear() === year ? new Date(monday) : null;
};

/** Понедельник недели под прежним именем (досье, повестка). */
export const aiIsoWeekMonday = aiIsoWeekMondayUtc;

const pad2 = (value: number): string => String(value).padStart(2, '0');

/** Дата в UTC → «дд.мм». */
export const formatAiDayMonthUtc = (date: Date): string =>
    `${pad2(date.getUTCDate())}.${pad2(date.getUTCMonth() + 1)}`;

/**
 * «2026-W31» → «27.07–02.08» (пн–вс); битый ключ — null. offsetWeeks
 * сдвигает неделю: −1 — неделя перед указанной (повестка планёрки).
 */
export const aiIsoWeekRange = (
    weekKey: string,
    offsetWeeks = 0,
): string | null => {
    const monday = aiIsoWeekMondayUtc(weekKey);
    if (!monday) return null;
    const from = new Date(
        monday.getTime() + offsetWeeks * DAYS_IN_WEEK * MS_PER_DAY,
    );
    const to = new Date(from.getTime() + (DAYS_IN_WEEK - 1) * MS_PER_DAY);
    return `${formatAiDayMonthUtc(from)}–${formatAiDayMonthUtc(to)}`;
};

/** Неделя «2026-W39» → «21.09–27.09»; не ключ — «—». */
export const formatAiWeekKey = (weekKey: string): string =>
    aiIsoWeekRange(weekKey) ?? AI_PERIOD_UNKNOWN;

/** Ключ точки ряда: неделя → даты, месяц → словами; иное — «—». */
export const formatAiPeriodKey = (key: string): string =>
    WEEK_KEY.test(key) ? formatAiWeekKey(key) : formatAiMonthKey(key);
