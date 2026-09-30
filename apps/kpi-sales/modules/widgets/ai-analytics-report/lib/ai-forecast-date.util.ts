import { addMonths, format, isValid, parseISO, startOfMonth } from 'date-fns';

/*
 * Срок карточки «Прогноз отдела»: когда история для проверки наберётся.
 * Вынесено из ai-forecast.util.ts по лимиту 300 строк (реэкспорт оттуда).
 */

const DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Когда наберётся нужное число закрытых месяцев: 1-е число месяца, идущего
 * через (нужно − есть) месяцев от текущего. Уже набрано или дата битая — null.
 */
export const aiForecastReadyDate = (
    today: string,
    logged: number,
    needed: number,
): string | null => {
    const left = Math.ceil(needed - logged);
    const date = parseISO(today.slice(0, 10));
    if (!Number.isFinite(left) || left <= 0 || !isValid(date)) return null;
    return format(startOfMonth(addMonths(date, left)), DATE_FORMAT);
};
