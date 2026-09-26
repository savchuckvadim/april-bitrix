// Сущность «AI-аналитика ОП»: настройки/готовность, пульс, повестка,
// обзор менеджер × тип (очередь + WS), «Внимание», срез по типу, уровни,
// реакции; Фаза 2 — план дня, AI-резюме периода (очередь + WS), слепая
// оценка руководителя, карточка стиля, «Как считаем». Загрузка флагов
// портала — feature/ai-flags; композиция — widgets/ai-analytics-report.
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
    AiRopMarkSaveState,
    AiSection,
    AiSectionData,
    AiStatus,
} from './model/ai-analytics-slice';
export {
    AI_ABOUT_ERROR_MESSAGE,
    AI_DAILY_PLAN_DISABLED_MESSAGE,
    AI_QUEUED_ERROR_MESSAGES,
    AI_ROP_MARK_SAVE_ERROR,
    fetchAiAbout,
    fetchAiAgenda,
    fetchAiAttention,
    fetchAiBrief,
    fetchAiByType,
    fetchAiDailyPlan,
    fetchAiDossier,
    fetchAiOverview,
    fetchAiPlanFact,
    fetchAiPulse,
    fetchAiRopMarkWeek,
    fetchAiSettings,
    fetchAiStyleProfile,
    isAiRopMarkWeekEmpty,
    recalcAiOverview,
    refreshAiAnalytics,
    saveAiLevels,
    saveAiRopMark,
    selectAiIsLeader,
    selectAiOverviewScope,
    selectAiRequester,
    sendAiFeedback,
    sendAiView,
} from './model/ai-analytics-thunks';
export type { AiQueuedLoadOptions } from './model/ai-analytics-thunks';
export {
    AI_SETTINGS_SAVE_ERROR,
    AI_SETTINGS_VIEW_AS_ERROR,
} from './model/ai-analytics-queued.thunks';
export { startAiRefetchListener } from './model/listeners/ai-refetch.listener';
export {
    AI_WS_EVENTS,
    startAiWsListener,
} from './model/listeners/ai-ws.listener';
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
export * from './lib/ai-trend.util';
export * from './lib/ai-plan-fact.util';
export * from './lib/ai-yoy.util';
export * from './lib/ai-dossier.util';
export {
    aiErrorMessage,
    aiErrorStatus,
    aiServerMessage,
} from './lib/ai-error.util';
export {
    AI_MAX_PERIOD_MONTHS,
    clampAiPeriod,
    aiToday,
} from './lib/ai-period.util';
export { buildAiRequestKey } from './lib/ai-request-key.util';
export { AiMetricValue } from './ui/AiMetricValue';
