/**
 * Название показателя для показа: `labelOf(ключ, исходное название)`.
 * Своё название портала подставляется только в выводимой строке (шапка,
 * подпись, легенда, строка Excel); данные, выборы и отборы работают по
 * исходным названиям.
 */
export type IndicatorLabeler = (key: string, fallback: string) => string;

/** Чистка названия для показа: пробелы по краям убраны, повторные схлопнуты. */
export const normalizeIndicatorName = (name: string): string =>
    name.replace(/\s+/g, ' ').trim();

/**
 * Функция названий по своим названиям портала: своё, если оно непустое,
 * иначе исходное название (тоже очищенное от лишних пробелов).
 */
export const createIndicatorLabeler = (
    labels: Readonly<Record<string, string>>,
): IndicatorLabeler => {
    const custom = new Map<string, string>();
    Object.entries(labels).forEach(([key, value]) => {
        if (typeof value !== 'string') return;
        const name = normalizeIndicatorName(value);
        if (name) custom.set(key, name);
    });
    return (key, fallback) => custom.get(key) ?? normalizeIndicatorName(fallback);
};

/** Без своих названий: только чистка пробелов исходного названия. */
export const defaultIndicatorLabeler: IndicatorLabeler = (_key, fallback) =>
    normalizeIndicatorName(fallback);
