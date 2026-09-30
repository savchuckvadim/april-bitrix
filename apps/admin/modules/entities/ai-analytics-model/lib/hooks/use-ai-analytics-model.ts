'use client';

import { useQuery } from '@tanstack/react-query';
import type { FeedbackPeriod } from '../feedback-period.util';
import { AiAnalyticsModelHelper } from '../api/ai-analytics-model-helper';

const helper = new AiAnalyticsModelHelper();

/** Общий префикс ключей кэша раздела «Модель и обратная связь». */
export const AI_ANALYTICS_MODEL_KEY = ['ai-analytics-model'] as const;

/**
 * Снапшоты читаются по выбранному порталу. Смена портала — новый запрос
 * без показа прежнего ответа: данные другого домена под новым выбором
 * вводили бы в заблуждение. Один повтор — сетевой сбой, не больше:
 * 403 и 400 повторами не лечатся.
 */
const QUERY_OPTIONS = { retry: 1 } as const;

/** Сводка обратной связи за период; невалидный период — запроса нет. */
export const useModelFeedback = (
    domain: string | undefined,
    period: FeedbackPeriod | null,
) =>
    useQuery({
        queryKey: [
            ...AI_ANALYTICS_MODEL_KEY,
            'feedback',
            domain ?? '',
            period?.from ?? '',
            period?.to ?? '',
        ],
        queryFn: () =>
            helper.feedback({
                domain: domain as string,
                from: (period as FeedbackPeriod).from,
                to: (period as FeedbackPeriod).to,
            }),
        enabled: !!domain && period !== null,
        ...QUERY_OPTIONS,
    });

/** Последний снапшот пула порталов. */
export const useModelPoolStatus = (domain: string | undefined) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_MODEL_KEY, 'pool', domain ?? ''],
        queryFn: () => helper.poolStatus(domain as string),
        enabled: !!domain,
        ...QUERY_OPTIONS,
    });

/** Проверки точности прогноза по закрытым месяцам. */
export const useModelForecastBacktest = (
    domain: string | undefined,
    months: number,
) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_MODEL_KEY, 'backtest', domain ?? '', months],
        queryFn: () => helper.forecastBacktest(domain as string, months),
        enabled: !!domain,
        ...QUERY_OPTIONS,
    });

/** Последний расчёт эффекта советов. */
export const useModelRecommendationEffect = (domain: string | undefined) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_MODEL_KEY, 'effect', domain ?? ''],
        queryFn: () => helper.recommendationEffect(domain as string),
        enabled: !!domain,
        ...QUERY_OPTIONS,
    });

/** Последний отчёт о связи качества с результатом. */
export const useModelQualityLink = (domain: string | undefined) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_MODEL_KEY, 'quality-link', domain ?? ''],
        queryFn: () => helper.qualityLink(domain as string),
        enabled: !!domain,
        ...QUERY_OPTIONS,
    });
