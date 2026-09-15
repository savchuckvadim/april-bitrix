'use client';

import { LiquidProgress, ToneBadge } from '@workspace/april-ui';
import {
    aiFewDataLabel,
    aiScoreShare,
    aiScoreTone,
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
 * числом и n; при confidence none — бэйдж «мало данных (n = …)».
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
                title={low ? 'Мало данных для выводов (n < 20)' : undefined}
            >
                {formatAiScore(metric.value)}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
                n = {metric.n}
            </span>
        </div>
    );
};
