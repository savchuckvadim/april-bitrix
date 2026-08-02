/**
 * Данные Processing-экрана сервиса. Вёрстка, тексты и механика — общие
 * с отчётом продаж (@workspace/april-ui); отличаются только палитра
 * и ключ персиста таймера.
 */

export {
    PROCESSING_DURATION_SEC,
    PROCESSING_TEXTS,
    TIMER_GRADIENT_SERVICE,
    TITLE_GRADIENT_SERVICE,
} from '@workspace/april-ui/feedback';

/**
 * Свой ключ персиста: отсчёт сервисного отчёта не должен продолжать
 * отсчёт отчёта продаж и наоборот.
 */
export const PROCESSING_TIMER_KEY = 'kpi-service-report-processing';
