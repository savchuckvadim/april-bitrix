/**
 * Данные Processing-экрана продаж. Тексты, длительность и fx-палитры живут
 * в дизайн-системе (@workspace/april-ui) — здесь только реэкспорт для
 * существующих импортов и СВОЙ ключ персиста таймера.
 */

export {
    PROCESSING_DURATION_SEC,
    PROCESSING_TEXTS,
    TIMER_GRADIENT,
    TITLE_GRADIENT,
    AURORA_COLOR_STOPS,
    LIQUID_COLORS,
    BENDS_COLORS,
} from '@workspace/april-ui/feedback';

/**
 * Ключ персиста старта таймера — переживает ремаунт экрана.
 * Свой на приложение: сборка отчёта продаж и сервиса не делят отсчёт.
 */
export const PROCESSING_TIMER_KEY = 'kpi-report-processing';
