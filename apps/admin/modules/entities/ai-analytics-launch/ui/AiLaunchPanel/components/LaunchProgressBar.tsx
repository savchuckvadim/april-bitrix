'use client';

import { LiquidProgress } from '@workspace/april-ui';
import { LAUNCH_TEXT } from '../../../consts/ai-analytics-launch.const';
import {
    reanalyzeProgress,
    type LaunchProgressSource,
} from '../../../lib/launch-progress';

/** Прогресс-бар переразбора: доля сделанного и счётчики словами. */
export const LaunchProgressBar = ({ run }: { run: LaunchProgressSource }) => {
    const view = reanalyzeProgress(run);
    return (
        <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium">{LAUNCH_TEXT.progressLabel}</span>
                <span className="tabular-nums text-muted-foreground">
                    {view.countText} · {Math.round(view.share * 100)}%
                </span>
            </div>
            <LiquidProgress
                value={view.share}
                tone={run.failed > 0 ? 'warning' : 'success'}
            />
            <p className="text-xs text-muted-foreground">
                {view.text} {run.finished ? '' : LAUNCH_TEXT.progressHint}
            </p>
        </div>
    );
};
