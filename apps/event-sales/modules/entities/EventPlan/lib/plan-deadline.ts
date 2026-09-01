import { parseCrmDate, toCrmDateTime } from '@/modules/shared/lib/crm-date';

/**
 * Срок планируемого события — данные и проверки, без UI.
 *
 * Срок в сторе живёт строкой контрола (`yyyy-MM-dd HH:mm`), но приезжать может
 * и от задачи (ISO дедлайна, `seedFromTask`). Что бы ни пришло, наружу уходит
 * одна строка — та же, что писал бэкенд (`DD.MM.YYYY HH:mm:ss`).
 *
 * Зачем проверка: без разбираемого срока `plan.isPlanned` молча становится
 * `false` — задача не создаётся, клиент остаётся без следующего шага, а экран
 * финиша всё равно рапортует об успехе. Поэтому срок проверяется до отправки.
 */

/** Срок задан и разбирается — из него получится дедлайн задачи. */
export const isPlanDeadlineValid = (
    raw: string | null | undefined,
): boolean => parseCrmDate(raw) !== null;

/**
 * Срок → дедлайн для payload отправки (`DD.MM.YYYY HH:mm:ss`).
 * Неразбираемый срок даёт пустую строку: бэкенд получит «плана нет»
 * вместо исключения на формате.
 */
export const toPlanDeadline = (raw: string | null | undefined): string =>
    toCrmDateTime(raw) ?? '';

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Срок → строка контрола DateTimePicker (`yyyy-MM-dd HH:mm`); мусор — ''.
 *
 * Зачем: контрол разбирает СТРОГО свой формат, а посев переноса приносит
 * ISO дедлайна задачи (`2026-08-31T06:51:00+02:00`). Без нормализации
 * контрол показывал пустую дату, менеджер ставил время — и `emit`
 * подставлял СЕГОДНЯ вместо даты задачи: перенос молча менял день
 * (инцидент владельца 31.08, todo3108 №2). Преобразование лексическое
 * (parseCrmDate) — настенное время портала не прогоняется через Date и
 * не сдвигается таймзоной браузера.
 */
export const toPlanControlValue = (raw: string | null | undefined): string => {
    const parts = parseCrmDate(raw);
    if (!parts) return '';
    return (
        `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ` +
        `${pad(parts.hours)}:${pad(parts.minutes)}`
    );
};
