/** Публичная поверхность раздела «AI-аналитика → Модель и обратная связь». */
export { AiAnalyticsModelPanel } from './ui/ai-analytics-model-panel/AiAnalyticsModelPanel';
export {
    AI_ANALYTICS_MODEL_KEY,
    useModelFeedback,
    useModelForecastBacktest,
    useModelPoolStatus,
    useModelQualityLink,
    useModelRecommendationEffect,
} from './lib/hooks';
export type {
    ModelFeedbackResult,
    ModelForecastBacktestResult,
    ModelPoolStatusResult,
    ModelQualityLinkResult,
    ModelRecommendationEffectResult,
} from './model';
