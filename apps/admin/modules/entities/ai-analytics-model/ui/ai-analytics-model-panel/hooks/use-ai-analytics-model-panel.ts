'use client';

import { useState } from 'react';
import { toPortalOptions } from '@/modules/entities/ai-analytics-audit';
import { usePortals } from '@/modules/entities/portal/hooks';
import {
    defaultFeedbackPeriod,
    isValidFeedbackPeriod,
    type FeedbackPeriod,
} from '../../../lib/feedback-period.util';
import {
    useModelFeedback,
    useModelForecastBacktest,
    useModelPoolStatus,
    useModelQualityLink,
    useModelRecommendationEffect,
} from '../../../lib/hooks';
import { AI_ANALYTICS_MODEL_DEFAULTS } from '../../../model';

/**
 * Логика страницы «Модель и обратная связь»: выбор портала (варианты —
 * общий util аудита), период сводки обратной связи и пять запросов
 * снапшотов по выбранному порталу. Невалидный период — запроса сводки
 * нет, остальные карточки живут своей жизнью.
 */
export const useAiAnalyticsModelPanel = () => {
    const [domain, setDomain] = useState<string | undefined>(undefined);
    const [period, setPeriod] = useState<FeedbackPeriod>(() =>
        defaultFeedbackPeriod(new Date(), AI_ANALYTICS_MODEL_DEFAULTS.feedbackDays),
    );

    const { data: portals } = usePortals();
    const isPeriodValid = isValidFeedbackPeriod(period);

    const feedback = useModelFeedback(domain, isPeriodValid ? period : null);
    const qualityLink = useModelQualityLink(domain);
    const backtest = useModelForecastBacktest(
        domain,
        AI_ANALYTICS_MODEL_DEFAULTS.backtestMonths,
    );
    const pool = useModelPoolStatus(domain);
    const effect = useModelRecommendationEffect(domain);

    return {
        form: {
            domain,
            portalOptions: toPortalOptions(portals),
            period,
            isPeriodValid,
        },
        actions: {
            selectDomain: setDomain,
            setFrom: (from: string) => setPeriod(prev => ({ ...prev, from })),
            setTo: (to: string) => setPeriod(prev => ({ ...prev, to })),
        },
        queries: { feedback, qualityLink, backtest, pool, effect },
    };
};

export type AiAnalyticsModelPanelState = ReturnType<typeof useAiAnalyticsModelPanel>;
