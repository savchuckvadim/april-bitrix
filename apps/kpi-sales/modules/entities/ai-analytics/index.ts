// Сущность «AI-аналитика ОП»: настройки/готовность, пульс, повестка,
// обзор менеджер × тип (очередь + WS), «Внимание», срез по типу, уровни,
// реакции. Загрузка флагов портала — feature/ai-flags; композиция —
// widgets/ai-analytics-report.
export * from './model';
export {
    AI_QUEUED_SECTIONS,
    aiAnalyticsActions,
    aiAnalyticsReducer,
} from './model/ai-analytics-slice';
export type {
    AiAnalyticsState,
    AiDataSection,
    AiJobStatus,
    AiQueuedSection,
    AiSection,
    AiSectionData,
    AiStatus,
} from './model/ai-analytics-slice';
export {
    fetchAiAgenda,
    fetchAiAttention,
    fetchAiByType,
    fetchAiOverview,
    fetchAiPulse,
    fetchAiSettings,
    recalcAiOverview,
    refreshAiAnalytics,
    saveAiLevels,
    selectAiOverviewScope,
    selectAiRequester,
    sendAiFeedback,
    sendAiView,
} from './model/ai-analytics-thunks';
export type { AiQueuedLoadOptions } from './model/ai-analytics-thunks';
export { startAiRefetchListener } from './model/listeners/ai-refetch.listener';
export { startAiWsListener } from './model/listeners/ai-ws.listener';
export * from './lib/ai-call-types.data';
export * from './lib/ai-readiness.data';
export * from './lib/ai-pulse.data';
export * from './lib/ai-overview.data';
export * from './lib/ai-metric.util';
export * from './lib/ai-pulse.util';
export * from './lib/ai-score.util';
export * from './lib/ai-finance.util';
export * from './lib/ai-attention.util';
export * from './lib/ai-overview.util';
export * from './lib/ai-by-type.util';
export * from './lib/ai-levels.util';
export * from './lib/ai-feedback.util';
export {
    AI_MAX_PERIOD_MONTHS,
    clampAiPeriod,
    aiToday,
} from './lib/ai-period.util';
export { buildAiRequestKey } from './lib/ai-request-key.util';
export { AiMetricValue } from './ui/AiMetricValue';
