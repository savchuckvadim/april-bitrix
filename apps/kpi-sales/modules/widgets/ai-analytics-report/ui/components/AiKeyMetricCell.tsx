'use client';

import { LiquidProgress, ToneBadge } from '@workspace/april-ui';
import {
    AI_METRIC_LOW_HINT,
    aiFewDataLabel,
    aiScoreShare,
    aiScoreTone,
    formatAiCallsShort,
    formatAiScore,
    hasAiMetricValue,
    isAiMetricLow,
    type AiMetric,
} from '@/modules/entities/ai-analytics';
import { cn } from '@workspace/ui/lib/utils';

interface AiKeyMetricCellProps {
    metric: AiMetric;
}

/**
 * Ключевая цифра строки: оценка качества 1–10 полосой LiquidProgress с
 * числом и объёмом «18 зв.»; при confidence none — бэйдж «мало данных».
 */
export const AiKeyMetricCell = ({ metric }: AiKeyMetricCellProps) => {
    if (!hasAiMetricValue(metric)) {
        return (
            <ToneBadge tone="muted" variant="soft" size="sm">
                {aiFewDataLabel(metric.n)}
            </ToneBadge>
        );
    }
    const low = isAiMetricLow(metric);
    return (
        <div className="flex min-w-32 items-center gap-2">
            <LiquidProgress
                value={aiScoreShare(metric.value)}
                tone={aiScoreTone(metric.value)}
                size="sm"
                className="flex-1"
            />
            <span
                className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    low && 'border-b border-dashed border-muted-foreground',
                )}
                title={low ? AI_METRIC_LOW_HINT : undefined}
            >
                {formatAiScore(metric.value)}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
                {formatAiCallsShort(metric.n)}
            </span>
        </div>
    );
};
