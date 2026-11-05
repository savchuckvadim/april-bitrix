'use client';

import { cn } from '@workspace/ui/lib/utils';
import { AI_PULSE_TEXT, type AiPulse } from '@/modules/entities/ai-analytics';
import { aiPulseSummary } from '../../lib/ai-pulse-coach.util';

interface AiPulseSummaryProps {
    pulse: AiPulse;
    /** Порог длительности для строки «Короткие»; null — не известен. */
    minDurationSec: number | null;
}

const T = AI_PULSE_TEXT;

const TREND_TONE = {
    better: 'text-emerald-600 dark:text-emerald-400',
    worse: 'text-destructive',
    same: 'text-muted-foreground',
} as const;

/**
 * Итог окна словами — для всех: какая доля разговоров закончилась
 * договорённостью с датой, как было неделей раньше, окно и короткие
 * разговоры. Разброс и «коридор» — в технических подробностях.
 */
export const AiPulseSummary = ({ pulse, minDurationSec }: AiPulseSummaryProps) => {
    const view = aiPulseSummary(pulse);
    return (
        <div className="space-y-1">
            {view.headline ? (
                <p className="text-base font-medium">{view.headline}</p>
            ) : (
                <p className="text-sm">{T.summary.few}</p>
            )}
            {view.trend && (
                <p className={cn('text-sm', TREND_TONE[view.trend.tone])}>
                    {view.trend.text}
                </p>
            )}
            <p className="text-xs text-muted-foreground">{view.window}</p>
            <p className="text-xs text-muted-foreground">
                {T.short.label}:{' '}
                {T.short.text(
                    pulse.shortCallsSharePct,
                    minDurationSec,
                    pulse.connectedCalls,
                )}
            </p>
        </div>
    );
};
