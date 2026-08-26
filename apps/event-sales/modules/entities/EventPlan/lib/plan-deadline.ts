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
