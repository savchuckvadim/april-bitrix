/**
 * Резолв финансовых токенов в строку цвета для canvas-чартов (chart.js
 * рисует на canvas, CSS-переменные там не работают). Компоненты client-only.
 */
const FALLBACKS: Record<string, string> = {
    '--finance-advance': 'oklch(0.627 0.17 149.2)',
    '--finance-monthly': 'oklch(0.588 0.158 241.966)',
    '--finance-potential': 'oklch(0.606 0.219 292.717)',
    '--finance-hot': 'oklch(0.769 0.16 70.7)',
};

export const resolveFinanceColor = (token: keyof typeof FALLBACKS): string => {
    if (typeof window === 'undefined') return FALLBACKS[token]!;
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(token)
        .trim();
    return value || FALLBACKS[token]!;
};

/** Палитра для донат-долей сотрудников (циклическая, из чарт-токенов). */
export const financeSeriesColor = (index: number): string => {
    const fallback = [
        'oklch(0.627 0.17 149.2)',
        'oklch(0.588 0.158 241.966)',
        'oklch(0.606 0.219 292.717)',
        'oklch(0.769 0.16 70.7)',
        'oklch(0.637 0.207 25.331)',
    ][index % 5]!;
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--chart-${(index % 5) + 1}`)
        .trim();
    return value || fallback;
};
