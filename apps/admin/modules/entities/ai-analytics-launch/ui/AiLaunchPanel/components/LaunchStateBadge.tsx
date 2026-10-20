'use client';

import { CheckCircle2, CircleDashed, HelpCircle, Loader2 } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui/badges';
import type { StatusTone } from '@workspace/april-ui/tones';
import { LAUNCH_STATE_LABEL } from '../../../consts/ai-analytics-launch.const';
import type { LaunchStepState } from '../../../model';

const TONE: Record<LaunchStepState, StatusTone> = {
    done: 'success',
    todo: 'warning',
    running: 'info',
    unknown: 'muted',
};

const ICON = {
    done: CheckCircle2,
    todo: CircleDashed,
    running: Loader2,
    unknown: HelpCircle,
} as const;

/** Состояние шага: галочка / нужно сделать / идёт / неизвестно. */
export const LaunchStateBadge = ({ state }: { state: LaunchStepState }) => {
    const Icon = ICON[state];
    return (
        <ToneBadge tone={TONE[state]} variant="soft">
            <Icon
                className={state === 'running' ? 'animate-spin' : undefined}
            />
            {LAUNCH_STATE_LABEL[state]}
        </ToneBadge>
    );
};
