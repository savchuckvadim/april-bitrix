/**
 * ЕДИНЫЙ источник цветов показателей конверсии — чтобы полоса-воронка,
 * график «Воронка» и легенды были согласованы. Цвет показателя — токен
 * `--kpi-action-<code>` (april-tokens.css), фолбэк — палитра чартов
 * `--chart-N` по индексу шага.
 */

/** CSS var-строка — для DOM-элементов (полоса, легенда). */
export const conversionColorVar = (code: string, index: number): string =>
    `var(--kpi-action-${code.replace(/_/g, '-')}, var(--chart-${(index % 5) + 1}))`;

/**
 * Runtime-значение цвета — для canvas (chart.js не умеет CSS var).
 * SSR-безопасно: без window отдаёт нейтральный серый.
 */
export const resolveConversionColor = (
    code: string,
    index: number,
): string => {
    if (typeof window === 'undefined') return 'rgba(150,150,150,1)';
    const styles = getComputedStyle(document.documentElement);
    const token = styles
        .getPropertyValue(`--kpi-action-${code.replace(/_/g, '-')}`)
        .trim();
    if (token) return token;
    const chart = styles
        .getPropertyValue(`--chart-${(index % 5) + 1}`)
        .trim();
    return chart || 'rgba(150,150,150,1)';
};

/** Сегмент сплошной полосы: лёгкий вертикальный градиент для объёма. */
export const conversionSegmentGradient = (
    code: string,
    index: number,
): string => {
    const color = conversionColorVar(code, index);
    return `linear-gradient(180deg, color-mix(in oklab, white 14%, ${color}), ${color})`;
};
