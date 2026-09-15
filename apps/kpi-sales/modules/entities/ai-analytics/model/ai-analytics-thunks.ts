/*
 * Публичная поверхность thunks AI-аналитики (реэкспорт), чтобы импорты
 * listeners/тестов/фич не зависели от разбиения:
 * - ai-analytics-thunks.shared — клиент, тайминги, requester;
 * - ai-analytics-sync.thunks — settings / pulse / agenda / feedback / refresh;
 * - ai-analytics-queued.thunks — overview / attention / byType (очередь +
 *   WS), resume / fail по WS, recalc, уровни.
 */
export {
    AI_POLL_INTERVAL_MS,
    AI_QUEUED_MAX_ATTEMPTS,
    AI_QUEUED_TIMEOUT_MS,
    selectAiRequester,
} from './ai-analytics-thunks.shared';
export {
    fetchAiAgenda,
    fetchAiPulse,
    fetchAiSettings,
    refreshAiAnalytics,
    sendAiFeedback,
    sendAiView,
} from './ai-analytics-sync.thunks';
export {
    failAiQueuedSections,
    fetchAiAttention,
    fetchAiByType,
    fetchAiOverview,
    recalcAiOverview,
    resumeAiQueuedSections,
    saveAiLevels,
    selectAiOverviewScope,
} from './ai-analytics-queued.thunks';
export type {
    AiOverviewScope,
    AiQueuedLoadOptions,
} from './ai-analytics-queued.thunks';
