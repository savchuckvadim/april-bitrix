import { format, isValid } from 'date-fns';

/**
 * Время расчёта отчёта для шапки: ISO 8601 → «12.11 в 10:40». Дата и время —
 * в часовом поясе браузера (так их видит человек). Некорректная строка → ''.
 */
export const formatCalculatedAt = (iso: string): string => {
    const date = new Date(iso);
    return isValid(date) ? format(date, "dd.MM 'в' HH:mm") : '';
};
