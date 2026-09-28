'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { AiMetric } from '../model';
import {
    AI_METRIC_LOW_HINT,
    aiByCallsLabel,
    aiConfidenceReasonLabel,
    aiFewDataLabel,
    formatAiCi90,
    isAiMetricHidden,
    isAiMetricLow,
} from '../lib/ai-metric.util';
import { formatAiMetricValue, type AiMetricKind } from '../lib/ai-score.util';

interface AiMetricValueProps {
    metric: AiMetric | null | undefined;
    /** Как читать value: доля 0..1 (по умолчанию), оценка 1–10, %, счётчик. */
    kind?: AiMetricKind;
    /** Крупная цифра (заголовок пульса) или строка таблицы. */
    size?: 'lg' | 'sm';
    /** Показывать рядом с цифрой, по скольким звонкам она и разброс. */
    withDetails?: boolean;
    className?: string;
}

/**
 * Честное значение метрики: confidence none → бэйдж «мало данных: N звонков»
 * без числа; low → значение пунктиром с подсказкой; ok — обычная цифра.
 * Рядом — «по N звонкам · разброс 31–55 %» (withDetails; разброс есть
 * только у долей).
 */
export const AiMetricValue = ({
    metric,
    kind = 'rate',
    size = 'sm',
    withDetails = false,
    className,
}: AiMetricValueProps) => {
    if (isAiMetricHidden(metric)) {
        const reason = aiConfidenceReasonLabel(metric?.confidence.reason);
        const badge = (
            <ToneBadge tone="muted" variant="soft" size="sm">
                {aiFewDataLabel(metric?.n ?? 0)}
            </ToneBadge>
        );
        return reason ? (
            <HintTooltip title="Значение скрыто" lines={[reason]}>
                <span className={className}>{badge}</span>
            </HintTooltip>
        ) : (
            <span className={className}>{badge}</span>
        );
    }

    const low = isAiMetricLow(metric);
    const ci = withDetails && kind === 'rate' ? formatAiCi90(metric?.ci90) : '';

    return (
        <span className={cn('inline-flex items-baseline gap-2', className)}>
            <span
                className={cn(
                    'font-semibold tabular-nums',
                    size === 'lg' ? 'text-3xl' : 'text-sm',
                    low && 'border-b border-dashed border-muted-foreground',
                )}
                title={low ? AI_METRIC_LOW_HINT : undefined}
            >
                {formatAiMetricValue(metric?.value, kind)}
            </span>
            {withDetails && (
                <span className="text-xs text-muted-foreground">
                    {aiByCallsLabel(metric?.n ?? 0)}
                    {ci && ` · разброс ${ci}`}
                </span>
            )}
        </span>
    );
};
