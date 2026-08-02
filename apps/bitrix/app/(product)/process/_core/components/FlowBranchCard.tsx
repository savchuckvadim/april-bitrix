'use client';

import type { FC } from 'react';
import { CornerDownLeft } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { ACTOR_LABEL } from '../lib/actor.util';
import type { FlowBranch, FlowBranchTone, ProcessActor } from '../types';
import { ReadinessBadge } from './ReadinessBadge';

const TONE_CLASS: Record<FlowBranchTone, string> = {
    neutral: 'border-border bg-card',
    good: 'border-success/50 bg-success/5',
    warn: 'border-warning/50 bg-warning/5',
    bad: 'border-destructive/50 bg-destructive/5',
};

const LABEL_CLASS: Record<FlowBranchTone, string> = {
    neutral: 'text-muted-foreground',
    good: 'text-success',
    warn: 'text-warning',
    bad: 'text-destructive',
};

interface FlowBranchCardProps {
    branch: FlowBranch;
    /** Ответственный со съезда, если ветка на него ведёт. */
    exitActor?: ProcessActor;
}

/** Одна ветка развилки. */
export const FlowBranchCard: FC<FlowBranchCardProps> = ({
    branch,
    exitActor,
}) => (
    <li
        className={cn(
            'flex min-w-0 flex-col rounded-xl border p-3',
            TONE_CLASS[branch.tone],
        )}
    >
        <div className="flex items-start justify-between gap-2">
            <p
                className={cn(
                    'text-sm font-bold text-balance',
                    LABEL_CLASS[branch.tone],
                )}
            >
                {branch.label}
            </p>
            {branch.readiness && <ReadinessBadge value={branch.readiness} />}
        </div>

        <p className="text-foreground/80 mt-1.5 flex-1 text-xs leading-relaxed">
            {branch.text}
        </p>

        {(exitActor || branch.loops) && (
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-[11px] font-semibold">
                {branch.loops && (
                    <>
                        <CornerDownLeft className="h-3 w-3" aria-hidden />
                        возврат в цикл
                    </>
                )}
                {exitActor && (
                    <>решает {ACTOR_LABEL[exitActor].toLowerCase()}</>
                )}
            </p>
        )}
    </li>
);
