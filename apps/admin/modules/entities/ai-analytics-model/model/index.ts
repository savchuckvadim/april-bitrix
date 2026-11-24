import type {
    AiAnalyticsEdgeBeforeAfterDto,
    AiAnalyticsFeedbackCostAdminFeedbackSummaryParams,
    AiAnalyticsFeedbackKindDtoKind,
    AiAnalyticsFeedbackManagerDto,
    AiAnalyticsFeedbackResultDto,
    AiAnalyticsForecastBacktestDtoStatus,
    AiAnalyticsForecastBacktestResultDto,
    AiForecastBreakdownEpisodeDto,
    AiAnalyticsLeverEffectDto,
    AiAnalyticsLeverEffectDtoLever,
    AiAnalyticsPhase4EstimateDto,
    AiAnalyticsPhase4ShareDto,
    AiAnalyticsPoolBetaDto,
    AiAnalyticsPoolPortalDto,
    AiAnalyticsPoolSnapshotDto,
    AiAnalyticsPoolSnapshotDtoStatus,
    AiAnalyticsPoolStatusResultDto,
    AiAnalyticsQualityLinkDto,
    AiAnalyticsQualityLinkDtoStatus,
    AiAnalyticsQualityLinkResultDto,
    AiAnalyticsRecommendationEffectDto,
    AiAnalyticsRecommendationEffectDtoGateStatus,
    AiAnalyticsRecommendationEffectResultDto,
} from '@workspace/nest-admin-api';

/**
 * Доменные алиасы generated-типов раздела «AI-аналитика → Модель и
 * обратная связь» (`Sales AI Analytics Admin`: `/api/admin/ai-analytics/
 * feedback`, `pool-status`, `forecast-backtest`, `recommendation-effect`,
 * `quality-link`). Формы ответов приходят из Swagger бэка; алиасы прогноза
 * с 18.11.2026 — в `forecast-flow.types.ts`.
 */

/** Период сводки обратной связи: даты YYYY-MM-DD включительно (UTC). */
export type ModelFeedbackQuery = AiAnalyticsFeedbackCostAdminFeedbackSummaryParams;
export type ModelFeedbackResult = AiAnalyticsFeedbackResultDto;
export type ModelFeedbackManager = AiAnalyticsFeedbackManagerDto;
export type ModelFeedbackKind = AiAnalyticsFeedbackKindDtoKind;

/** Проверки точности прогноза; пункты — с методом расчёта (с 18.11.2026). */
export type ModelForecastBacktestResult = AiAnalyticsForecastBacktestResultDto;
export type ModelForecastBacktestStatus = AiAnalyticsForecastBacktestDtoStatus;

/** Разложение прогноза отдела на слагаемые (`forecast-breakdown`). */
export type ModelForecastBreakdownEpisode = AiForecastBreakdownEpisodeDto;
export type {
    ModelForecastBacktest,
    ModelForecastBreakdownDepartment,
    ModelForecastBreakdownFlow,
    ModelForecastBreakdownManager,
    ModelForecastBreakdownManagerFlow,
    ModelForecastBreakdownResult,
    ModelForecastFlowSource,
    ModelForecastFlowStatus,
    ModelForecastMethod,
} from './forecast-flow.types';

export type ModelPoolStatusResult = AiAnalyticsPoolStatusResultDto;
export type ModelPoolSnapshot = AiAnalyticsPoolSnapshotDto;
export type ModelPoolStatus = AiAnalyticsPoolSnapshotDtoStatus;
export type ModelPoolPortal = AiAnalyticsPoolPortalDto;
export type ModelPoolBeta = AiAnalyticsPoolBetaDto;

export type ModelQualityLinkResult = AiAnalyticsQualityLinkResultDto;
export type ModelQualityLink = AiAnalyticsQualityLinkDto;
export type ModelQualityLinkStatus = AiAnalyticsQualityLinkDtoStatus;
/** Оценка с интервалом 90 %: [нижняя, верхняя]. */
export type ModelEstimate = AiAnalyticsPhase4EstimateDto;

export type ModelRecommendationEffectResult = AiAnalyticsRecommendationEffectResultDto;
export type ModelRecommendationEffect = AiAnalyticsRecommendationEffectDto;
export type ModelRecommendationGateStatus = AiAnalyticsRecommendationEffectDtoGateStatus;
export type ModelLeverEffect = AiAnalyticsLeverEffectDto;
export type ModelLever = AiAnalyticsLeverEffectDtoLever;
export type ModelEdgeBeforeAfter = AiAnalyticsEdgeBeforeAfterDto;
/** Доля с интервалом; value/ci90 = null — наблюдений меньше порога. */
export type ModelShare = AiAnalyticsPhase4ShareDto;

/** Умолчания и границы запросов раздела. */
export const AI_ANALYTICS_MODEL_DEFAULTS = {
    /** Сколько закрытых месяцев проверки прогноза просить (бэк: 1–24). */
    backtestMonths: 12,
    /** Окно сводки обратной связи по умолчанию, дней (сегодня включительно). */
    feedbackDays: 30,
} as const;
