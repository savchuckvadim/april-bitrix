'use client';

import { MODEL_TEXT } from '../../consts/ai-analytics-model.const';
import {
    FeedbackCard,
    ForecastBacktestCard,
    PoolCard,
    QualityLinkCard,
    RecommendationEffectCard,
} from '../model-cards';
import { ModelPortalForm } from './components/ModelPortalForm';
import { useAiAnalyticsModelPanel } from './hooks/use-ai-analytics-model-panel';

/**
 * Раздел «AI-аналитика ОП → Модель и обратная связь»: выбор портала и
 * пять карточек только для чтения — обратная связь, связь качества с
 * результатом, точность прогноза, пул порталов, эффект советов.
 */
export const AiAnalyticsModelPanel = () => {
    const { form, actions, queries } = useAiAnalyticsModelPanel();

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">{MODEL_TEXT.pageTitle}</h1>
            <ModelPortalForm form={form} actions={actions} />
            <FeedbackCard
                domain={form.domain}
                query={queries.feedback}
                isPeriodValid={form.isPeriodValid}
            />
            <QualityLinkCard domain={form.domain} query={queries.qualityLink} />
            <ForecastBacktestCard domain={form.domain} query={queries.backtest} />
            <PoolCard domain={form.domain} query={queries.pool} />
            <RecommendationEffectCard domain={form.domain} query={queries.effect} />
        </div>
    );
};
