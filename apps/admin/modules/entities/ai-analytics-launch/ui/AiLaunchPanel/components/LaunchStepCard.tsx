'use client';

import { useState, type ReactNode } from 'react';
import { AButton } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { ConfirmDialog } from '@/modules/shared';
import { LAUNCH_TEXT } from '../../../consts/ai-analytics-launch.const';
import type { LaunchStepView } from '../../../lib/launch-steps';
import type { LaunchOutcome } from '../../../model';
import { LaunchOutcomeView } from './LaunchOutcomeView';
import { LaunchStateBadge } from './LaunchStateBadge';

interface LaunchStepCardProps {
    step: LaunchStepView;
    /** Кнопка этого шага сейчас выполняется. */
    pending: boolean;
    /** Выполняется другой шаг — кнопки ждут. */
    busy: boolean;
    outcome?: LaunchOutcome | null;
    error?: string | null;
    onRun: () => void;
    /** Под кнопкой: прогресс-бар, ссылка «принудительно». */
    children?: ReactNode;
}

/**
 * Карточка шага: номер, крупное название, одна строка «что сделает»,
 * состояние из сводки, большая кнопка с подтверждением, итог словами.
 */
export const LaunchStepCard = ({
    step,
    pending,
    busy,
    outcome,
    error,
    onRun,
    children,
}: LaunchStepCardProps) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const active = step.enabled && !busy;
    return (
        <li
            id={`launch-step-${step.code}`}
            className={cn(
                'flex flex-col gap-3 rounded-lg border bg-card p-4',
                step.state === 'done' && 'border-success/40',
            )}
        >
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {step.number}
                </span>
                <div className="min-w-0 space-y-1">
                    <h3 className="text-lg font-semibold leading-tight">
                        {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.what}</p>
                </div>
            </div>
            <div className="space-y-1">
                <LaunchStateBadge state={step.state} />
                <p className="text-sm">{step.stateText}</p>
            </div>
            <div className="mt-auto space-y-2">
                <AButton
                    title={pending ? LAUNCH_TEXT.running : step.button}
                    size="big"
                    isActive={active}
                    clickHendler={
                        active ? () => setConfirmOpen(true) : undefined
                    }
                />
                {!step.enabled && step.disabledReason && (
                    <p className="text-xs text-muted-foreground">
                        {step.disabledReason}
                    </p>
                )}
                {children}
                <LaunchOutcomeView outcome={outcome} error={error} />
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={`${step.number}. ${step.title}`}
                description={step.confirm}
                onConfirm={onRun}
                confirmLabel={LAUNCH_TEXT.confirm}
                cancelLabel={LAUNCH_TEXT.cancel}
                isLoading={pending}
            />
        </li>
    );
};
