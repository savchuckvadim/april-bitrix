/**
 * Цвета canvas-графиков дайджеста из токенов темы (april-tokens.css,
 * блок --digest-*). getComputedStyle — потому что chart.js нужна готовая
 * строка; фолбэки повторяют значения токенов.
 */
const FALLBACK: Record<string, string> = {
    '--digest-done': 'rgba(35, 186, 35, 1)',
    '--digest-not-held': 'rgba(255, 96, 85, 1)',
    '--digest-postponed': 'rgba(255, 180, 0, 1)',
    '--digest-expired': 'rgba(160, 160, 160, 1)',
    '--digest-planned': 'rgba(30, 144, 255, 1)',
    '--digest-planned-at-start': 'rgba(135, 206, 250, 1)',
    '--digest-documents': 'rgba(48, 224, 226, 1)',
    '--digest-sales': 'rgba(20, 150, 20, 1)',
    '--digest-refusals': 'rgba(200, 60, 50, 1)',
    '--digest-calls': 'rgba(106, 180, 242, 1)',
    '--digest-airtime': 'rgba(166, 110, 200, 1)',
};

export const resolveDigestToken = (token: string): string => {
    const fallback = FALLBACK[token] ?? 'rgba(128, 128, 128, 1)';
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(token)
        .trim();
    return value || fallback;
};

/** rgba(r, g, b, a) с заменой альфы (для подложек баров). */
export const withAlpha = (color: string, alpha: number): string => {
    const match = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/.exec(color);
    if (!match) return color;
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
};

/** Цвет текста/сетки графика из темы (foreground приглушённый). */
export const resolveChartInk = (): string => {
    if (typeof window === 'undefined') return 'rgba(128, 128, 128, 0.8)';
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--kpi-action-call-pound')
        .trim();
    return value || 'rgba(128, 128, 128, 0.8)';
};
