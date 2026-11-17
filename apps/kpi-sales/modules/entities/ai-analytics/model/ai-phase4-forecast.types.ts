import type {
    AiForecastBacktestSummaryDto,
    AiForecastBacktestSummaryDtoStatus,
    AiForecastBandDto,
    AiForecastDto,
    AiForecastDtoMode,
    AiForecastShadowDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Алиасы DTO Фазы 4: прогноз отдела и готовность L4/L5 (волна C, поток C1).
 * Реэкспортируются из `model/index.ts`; сам барель не растёт.
 */

/** Прогноз отдела на текущий месяц (POST ai-analytics/forecast, sync, только руководителям). */
export type AiForecast = AiForecastDto;
/** Режим: published — вилка проверена на истории и показ включён; shadow — копится в тени. */
export type AiForecastMode = AiForecastDtoMode;
/** Вилка: нижняя граница, середина, верхняя граница (продажи или рубли). */
export type AiForecastBand = AiForecastBandDto;
/** Теневой режим: закрытых месяцев в журнале, сколько нужно, последняя проверка. */
export type AiForecastShadow = AiForecastShadowDto;
/** Сводка проверки точности прогноза на истории. */
export type AiForecastBacktest = AiForecastBacktestSummaryDto;
/** Итог проверки: pass | fail | insufficient. */
export type AiForecastBacktestStatus = AiForecastBacktestSummaryDtoStatus;

/**
 * Уточнение пометки числа прогноза (`shown.detail`, с 18.11.2026; клиент
 * API его ещё не знает — orval не перегенерирован): presentations-missing —
 * презентации отмечаются не полностью, показан простой расчёт;
 * method-history-short — прогноз считается по-новому, на прошлых месяцах
 * его ещё не проверили. Старый бэкенд поля не присылает.
 */
export const AI_FORECAST_SHOWN_DETAILS = [
    'presentations-missing',
    'method-history-short',
] as const;
export type AiForecastShownDetail = (typeof AI_FORECAST_SHOWN_DETAILS)[number];
