'use client';

import { HintTooltip, LiquidProgress, ToneBadge } from '@workspace/april-ui';
import {
    aiFewDataHint,
    aiMetricHiddenLabel,
    aiMetricLowHint,
    aiMetricLowHintLines,
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
 * числом и объёмом «18 зв.»; при confidence none — бэйдж «мало данных» с
 * подсказкой о пороге; при low — цифра пунктиром с подсказкой.
 */
export const AiKeyMetricCell = ({ metric }: AiKeyMetricCellProps) => {
    if (!hasAiMetricValue(metric)) {
        const hint = aiFewDataHint(metric, 'score');
        return (
            <HintTooltip title={hint.title} lines={[...hint.lines]}>
                <span>
                    <ToneBadge tone="muted" variant="soft" size="sm">
                        {aiMetricHiddenLabel(metric)}
                    </ToneBadge>
                </span>
            </HintTooltip>
        );
    }
    const low = isAiMetricLow(metric);
    const value = (
        <span
            className={cn(
                'shrink-0 text-sm font-semibold tabular-nums',
                low && 'cursor-help border-b border-dashed border-muted-foreground',
            )}
        >
            {formatAiScore(metric.value)}
        </span>
    );
    return (
        <div className="flex min-w-32 items-center gap-2">
            <LiquidProgress
                value={aiScoreShare(metric.value)}
                tone={aiScoreTone(metric.value)}
                size="sm"
                className="flex-1"
            />
            {low ? (
                <HintTooltip
                    title={aiMetricLowHint('score')}
                    lines={aiMetricLowHintLines('score')}
                >
                    {value}
                </HintTooltip>
            ) : (
                value
            )}
            <span className="shrink-0 text-xs text-muted-foreground">
                {formatAiCallsShort(metric.n)}
            </span>
        </div>
    );
};
