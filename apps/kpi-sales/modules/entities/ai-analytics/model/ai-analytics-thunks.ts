/*
 * Публичная поверхность thunks AI-аналитики (реэкспорт), чтобы импорты
 * listeners/тестов/фич не зависели от разбиения:
 * - ai-analytics-thunks.shared — клиент, тайминги, requester, руководитель;
 * - ai-analytics-sync.thunks — settings / pulse / agenda / план дня /
 *   стиль / refresh;
 * - ai-analytics-feedback.thunks — реакции и view-телеметрия;
 * - ai-analytics-queued.loader — периметр обзора, ключи и общий загрузчик
 *   тяжёлых секций (очередь + WS);
 * - ai-analytics-queued.thunks — overview / attention / byType / brief /
 *   dossier, resume / fail по WS, recalc, уровни;
 * - ai-analytics-types-matrix.thunks — срез «все типы × wide» для матриц
 *   KPI-вида (секция typesMatrix);
 * - ai-analytics-rop-mark.thunks — слепая оценка (list | pick | save);
 * - ai-analytics-about.thunks — «Как считаем» (кэш по ручке).
 */
export {
    AI_POLL_INTERVAL_MS,
    AI_QUEUED_MAX_ATTEMPTS,
    AI_QUEUED_TIMEOUT_MS,
    selectAiIsLeader,
    selectAiRequester,
} from './ai-analytics-thunks.shared';
export {
    AI_DAILY_PLAN_DISABLED_MESSAGE,
    fetchAiAgenda,
    fetchAiDailyPlan,
    fetchAiPlanFact,
    fetchAiPulse,
    fetchAiSettings,
    fetchAiStyleProfile,
    refreshAiAnalytics,
} from './ai-analytics-sync.thunks';
export { sendAiFeedback, sendAiView } from './ai-analytics-feedback.thunks';
export {
    AI_QUEUED_ERROR_MESSAGES,
    AI_TYPES_MATRIX_KEY_PART,
    selectAiOverviewScope,
} from './ai-analytics-queued.loader';
export type {
    AiOverviewScope,
    AiQueuedLoadOptions,
} from './ai-analytics-queued.loader';
export {
    failAiQueuedSections,
    fetchAiAttention,
    fetchAiBrief,
    fetchAiByType,
    fetchAiDossier,
    fetchAiOverview,
    recalcAiOverview,
    resumeAiQueuedSections,
    saveAiLevels,
} from './ai-analytics-queued.thunks';
export { fetchAiTypesMatrix } from './ai-analytics-types-matrix.thunks';
export {
    AI_ROP_MARK_SAVE_ERROR,
    fetchAiRopMarkWeek,
    isAiRopMarkWeekEmpty,
    saveAiRopMark,
} from './ai-analytics-rop-mark.thunks';
export {
    AI_ABOUT_ERROR_MESSAGE,
    fetchAiAbout,
} from './ai-analytics-about.thunks';
export {
    AI_FORECAST_KEY_PART,
    fetchAiForecast,
} from './ai-analytics-forecast.thunks';
