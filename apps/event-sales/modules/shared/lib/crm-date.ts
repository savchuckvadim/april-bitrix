/**
 * Единый нормализатор дат портала.
 *
 * До этого каждый писавший в CRM отправлял то, что отдал браузерный контрол:
 * `<input type="date">` — `YYYY-MM-DD`, `datetime-local` — `YYYY-MM-DDTHH:mm`.
 * Портал такие строки принимает не везде и трактует по-своему, а бэкенд
 * (`BitrixDateTime.toCrmDateTime`, `libs/shared/lib/date`) давно пишет
 * UF-поля в одном формате — `DD.MM.YYYY HH:mm:ss`. Здесь тот же канон для
 * фронта, чтобы одно и то же поле не лежало в двух диалектах.
 *
 * Преобразование ЛЕКСИЧЕСКОЕ, без `new Date()`: менеджер вводит настенное
 * время портала, а таймзона браузера может отличаться от портальной —
 * прогон через `Date` сдвигал бы дату на сутки у полуночных значений.
 */

/** Разобранные части момента; отсутствующее время — нули. */
export interface CrmDateParts {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const ISO_RE =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;
const CRM_RE = /^(\d{2})\.(\d{2})\.(\d{4})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;

const pad = (value: number, length = 2): string =>
    String(value).padStart(length, '0');

const isRealDate = (parts: CrmDateParts): boolean =>
    parts.month >= 1 &&
    parts.month <= 12 &&
    parts.day >= 1 &&
    parts.day <= 31 &&
    parts.hours <= 23 &&
    parts.minutes <= 59 &&
    parts.seconds <= 59;

/**
 * Разбор любого диалекта, который встречается на входе: ISO из контролов и
 * из ответов REST (`2026-08-26T03:00:00+03:00`), CRM-строка портала
 * (`26.08.2026 15:04:05`). Мусор и пустота — `null`.
 */
export const parseCrmDate = (raw: unknown): CrmDateParts | null => {
    if (typeof raw !== 'string') return null;
    const value = raw.trim();
    if (!value) return null;

    const iso = value.match(ISO_RE);
    if (iso) {
        const parts: CrmDateParts = {
            year: Number(iso[1]),
            month: Number(iso[2]),
            day: Number(iso[3]),
            hours: Number(iso[4] ?? 0),
            minutes: Number(iso[5] ?? 0),
            seconds: Number(iso[6] ?? 0),
        };
        return isRealDate(parts) ? parts : null;
    }

    const crm = value.match(CRM_RE);
    if (crm) {
        const parts: CrmDateParts = {
            year: Number(crm[3]),
            month: Number(crm[2]),
            day: Number(crm[1]),
            hours: Number(crm[4] ?? 0),
            minutes: Number(crm[5] ?? 0),
            seconds: Number(crm[6] ?? 0),
        };
        return isRealDate(parts) ? parts : null;
    }

    return null;
};

/** Значение для CRM date-поля: `DD.MM.YYYY`. Не разобралось — `null`. */
export const toCrmDate = (raw: unknown): string | null => {
    const parts = parseCrmDate(raw);
    if (!parts) return null;
    return `${pad(parts.day)}.${pad(parts.month)}.${pad(parts.year, 4)}`;
};

/**
 * Значение для CRM datetime-поля: `DD.MM.YYYY HH:mm:ss` — ровно то, что
 * пишет бэкенд (`BitrixDateTime.toCrmDateTime`).
 */
export const toCrmDateTime = (raw: unknown): string | null => {
    const parts = parseCrmDate(raw);
    if (!parts) return null;
    return (
        `${pad(parts.day)}.${pad(parts.month)}.${pad(parts.year, 4)} ` +
        `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
    );
};

/** Значение для `<input type="date">`: `YYYY-MM-DD` («» — нечего показать). */
export const toDateInputValue = (raw: unknown): string => {
    const parts = parseCrmDate(raw);
    if (!parts) return '';
    return `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}`;
};

/**
 * Значение для `<input type="datetime-local">`: `YYYY-MM-DDTHH:mm`.
 * Время в источнике отсутствовало — подставляются нули, контрол покажет 00:00.
 */
export const toDateTimeInputValue = (raw: unknown): string => {
    const parts = parseCrmDate(raw);
    if (!parts) return '';
    return (
        `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}` +
        `T${pad(parts.hours)}:${pad(parts.minutes)}`
    );
};

/** Человекочитаемая дата `DD.MM.YYYY` («» — нечего показать). */
export const toHumanDate = (raw: unknown): string => toCrmDate(raw) ?? '';

/** Человекочитаемые дата и время `DD.MM.YYYY HH:mm`. */
export const toHumanDateTime = (raw: unknown): string => {
    const parts = parseCrmDate(raw);
    if (!parts) return '';
    return (
        `${pad(parts.day)}.${pad(parts.month)}.${pad(parts.year, 4)} ` +
        `${pad(parts.hours)}:${pad(parts.minutes)}`
    );
};
