import type { AiDealMovementStatus } from '@/modules/entities/ai-analytics';
import { AI_DM_STATUS_COLOR_TOKEN } from './ai-deal-movement-status.util';

/*
 * Цвет статуса для canvas-графика: значение токена темы с <html> (chart.js
 * не понимает CSS-переменные). Вне браузера или без токена — запасной цвет
 * светлой темы.
 */

const FALLBACK: Record<AiDealMovementStatus, string> = {
    rolled_back: 'oklch(57.7% 0.245 27.325)',
    abandoned: 'oklch(55.6% 0 0)',
    stuck: 'oklch(76.9% 0.16 70.7)',
    at_risk: 'oklch(62% 0.14 235)',
    moving: 'oklch(62.7% 0.17 149.2)',
};

export const aiDmStatusColor = (status: AiDealMovementStatus): string => {
    if (typeof window === 'undefined') return FALLBACK[status];
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(AI_DM_STATUS_COLOR_TOKEN[status])
        .trim();
    return value || FALLBACK[status];
};
