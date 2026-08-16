/**
 * Расчёт срока договора в месяцах и подсветка «подарочных» периодов.
 * Чистые утилиты без зависимостей (перенос из легаси services/event 1:1).
 *
 * Правило (подтверждено пользователем 2026-08-15): полные календарные месяцы
 * от даты «с»; остаток СТРОГО БОЛЬШЕ 15 дней добавляет ещё один месяц.
 *   10.01–25.07 → 6 полных + 15 дней → 6 мес.
 *   10.01–26.07 → 6 полных + 16 дней → 7 мес.
 * NB: в легаси packages/event-sales-flow/shared/lib/contract-months.ts живёт
 * близнец с правилом «≥ 15 → +1» — расхождение осознанное.
 *
 * Все функции работают со строками 'yyyy-MM-dd' — таймзоны в расчёте не
 * участвуют (поле в Bitrix бывает Date или DateTime в зависимости от портала).
 */

/** Типовые сроки 6/12/24 + подарочные месяцы сверху — предупреждаем жёлтым. */
export const GIFT_WARNING_MONTHS: ReadonlySet<number> = new Set([7, 13, 25, 26]);

export const isGiftMonths = (months: number): boolean =>
    GIFT_WARNING_MONTHS.has(months);

export const GIFT_MONTHS_TOOLTIP =
    'Месяцы в подарок не включаем в период действия договора';

/** 'yyyy-MM-dd' -> локальная Date (не через new Date(string): там UTC). */
const parseDateOnly = (iso: string): Date | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
    if (!m) return null;
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(date.getTime()) ? null : date;
};

/** +N месяцев с клампом дня (31.01 + 1 мес = 28/29.02). */
const addMonthsClamped = (date: Date, months: number): Date => {
    const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const daysInMonth = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0,
    ).getDate();
    result.setDate(Math.min(date.getDate(), daysInMonth));
    return result;
};

/** Срок договора в месяцах или null, если даты невалидны/пустые/«с» позже «по». */
export const countContractMonths = (
    fromIso: string,
    toIso: string,
): number | null => {
    const from = parseDateOnly(fromIso);
    const to = parseDateOnly(toIso);
    if (!from || !to || from > to) return null;

    let fullMonths = 0;
    while (addMonthsClamped(from, fullMonths + 1) <= to) {
        fullMonths += 1;
    }
    const cursor = addMonthsClamped(from, fullMonths);
    const restDays = Math.round((to.getTime() - cursor.getTime()) / 86400000);
    return fullMonths + (restDays > 15 ? 1 : 0);
};

/** 'yyyy-MM-dd' -> 'dd.MM.yyyy' (чисто строково, без Date). */
export const formatRuDate = (iso: string): string => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
    return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
};

/**
 * Значение поля Bitrix -> 'yyyy-MM-dd' для input type="date".
 * Поле бывает Date ('2026-08-12') или DateTime ('2026-08-12T00:00:00+03:00') —
 * у обоих ISO-форматов первые 10 символов это дата в таймзоне портала, берём
 * их без парсинга в Date (парсинг может сдвинуть день из-за таймзон).
 */
export const normalizeToDateOnly = (value: unknown): string => {
    if (!value || typeof value !== 'string') return '';
    const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];
    return '';
};
