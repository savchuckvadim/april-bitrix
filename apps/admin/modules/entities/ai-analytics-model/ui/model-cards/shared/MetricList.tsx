'use client';

import { Info } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';
import { TONE_TEXT } from '@workspace/april-ui/tones';
import { cn } from '@workspace/ui/lib/utils';
import type { ModelMetricView } from '../../../lib/model-view.types';

interface MetricListProps {
    title?: string;
    metrics: ModelMetricView[];
}

/**
 * Список «показатель — значение» в две колонки. Пояснение показателя —
 * в подсказке у подписи, цвет значения — из единого реестра тонов.
 */
export const MetricList = ({ title, metrics }: MetricListProps) => (
    <div className="space-y-2">
        {title && <h4 className="text-sm font-medium">{title}</h4>}
        <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            {metrics.map(metric => (
                <div key={metric.label} className="contents">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                        {metric.label}
                        {metric.hint && (
                            <HintTooltip title={metric.label} lines={[metric.hint]}>
                                <button
                                    type="button"
                                    aria-label={metric.hint}
                                    className="inline-flex text-muted-foreground/70 hover:text-foreground"
                                >
                                    <Info className="size-3.5" />
                                </button>
                            </HintTooltip>
                        )}
                    </dt>
                    <dd
                        className={cn(
                            'tabular-nums',
                            metric.tone && TONE_TEXT[metric.tone],
                        )}
                    >
                        {metric.value}
                    </dd>
                </div>
            ))}
        </dl>
    </div>
);
