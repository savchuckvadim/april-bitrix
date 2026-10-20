'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { AiMetric } from '../model';
import {
    aiByCallsLabel,
    aiFewDataHint,
    aiMetricHiddenLabel,
    aiMetricLowHint,
    aiMetricLowHintLines,
    formatAiCi90,
    isAiMetricHidden,
    isAiMetricLow,
    type AiMetricThresholds,
    type AiMetricThresholdKind,
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
    /** Действующие пороги портала из ответа бэка; нет — дефолты реестра. */
    thresholds?: AiMetricThresholds;
    /** Своя подпись бэйджа «мало данных» (например, «оценка с 8 звонков (сейчас 5)»). */
    hiddenLabel?: string;
    className?: string;
}

/** Пороги пунктира: оценки и счётчики — по оценкам, доли и проценты — по долям. */
const thresholdKind = (kind: AiMetricKind): AiMetricThresholdKind =>
    kind === 'rate' || kind === 'pct' ? 'rate' : 'score';

/**
 * Честное значение метрики: confidence none → бэйдж «мало данных: N звонков»
 * с подсказкой о пороге; low → значение пунктиром с подсказкой; ok —
 * обычная цифра. Рядом — «по N звонкам · разброс 31–55 %» (withDetails;
 * разброс есть только у долей).
 */
export const AiMetricValue = ({
    metric,
    kind = 'rate',
    size = 'sm',
    withDetails = false,
    thresholds,
    hiddenLabel,
    className,
}: AiMetricValueProps) => {
    const tKind = thresholdKind(kind);

    if (isAiMetricHidden(metric)) {
        const hint = aiFewDataHint(metric, tKind, thresholds);
        return (
            <HintTooltip title={hint.title} lines={[...hint.lines]}>
                <span className={className}>
                    <ToneBadge tone="muted" variant="soft" size="sm">
                        {hiddenLabel ?? aiMetricHiddenLabel(metric)}
                    </ToneBadge>
                </span>
            </HintTooltip>
        );
    }

    const low = isAiMetricLow(metric);
    const ci = withDetails && kind === 'rate' ? formatAiCi90(metric?.ci90) : '';
    const value = (
        <span
            className={cn(
                'font-semibold tabular-nums',
                size === 'lg' ? 'text-3xl' : 'text-sm',
                low && 'cursor-help border-b border-dashed border-muted-foreground',
            )}
        >
            {formatAiMetricValue(metric?.value, kind)}
        </span>
    );

    return (
        <span className={cn('inline-flex items-baseline gap-2', className)}>
            {low ? (
                <HintTooltip
                    title={aiMetricLowHint(tKind, thresholds)}
                    lines={aiMetricLowHintLines(tKind, thresholds)}
                >
                    {value}
                </HintTooltip>
            ) : (
                value
            )}
            {withDetails && (
                <span className="text-xs text-muted-foreground">
                    {aiByCallsLabel(metric?.n ?? 0)}
                    {ci && ` · разброс ${ci}`}
                </span>
            )}
        </span>
    );
};
