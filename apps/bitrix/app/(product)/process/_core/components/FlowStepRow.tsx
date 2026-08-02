'use client';

import type { FC } from 'react';
import { ChevronRight, Cog, Flag, PhoneCall, Split } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { ACTOR_DOT, ACTOR_LABEL } from '../lib/actor.util';
import { resolveFlowStepContext } from '../lib/flow-context.util';
import type {
    FlowStep,
    FlowStepKind,
    ProcessActor,
    ProcessModel,
    StageOwner,
} from '../types';
import { FlowBranchCard } from './FlowBranchCard';
import { ReadinessBadge } from './ReadinessBadge';

const KIND_ICON: Record<FlowStepKind, typeof Cog> = {
    event: Flag,
    action: PhoneCall,
    system: Cog,
    gateway: Split,
};

const KIND_ACCENT: Record<FlowStepKind, string> = {
    event: 'text-event-lead',
    action: 'text-muted-foreground',
    system: 'text-primary',
    gateway: 'text-warning',
};

/** Чип сущности: цвет тот же, что у полос покрытия на хребте. */
const PLACE_CLASS: Record<StageOwner | 'cycle', string> = {
    lead: 'border-event-lead/50 bg-event-lead/10 text-event-lead',
    deal: 'border-primary/50 bg-primary/10 text-primary',
    both: 'border-warning/50 bg-warning/10 text-warning',
    none: 'border-destructive/50 bg-destructive/10 text-destructive',
    cycle: 'border-primary/40 bg-primary/5 text-primary',
};

interface FlowStepRowProps {
    step: FlowStep;
    model: ProcessModel;
    /** Ответственные со съездов: exitId → кто решает. */
    exitActors: Map<string, ProcessActor>;
}

/**
 * Шаг детального процесса компактной строкой.
 *
 * В одну строку помещается всё, что нужно понять с первого взгляда: что за шаг,
 * ГДЕ он происходит (в лиде или в сделке) и КТО его делает. Подробности —
 * подпроцесс и работа автоматики — раскрываются по клику, чтобы схема
 * оставалась обозримой.
 */
export const FlowStepRow: FC<FlowStepRowProps> = ({
    step,
    model,
    exitActors,
}) => {
    const Icon = KIND_ICON[step.kind];
    const { owner, placeLabel, actor } = resolveFlowStepContext(model, step);
    const hasDetails = Boolean(
        step.hint || step.systemDoes?.length || step.branches?.length,
    );

    const head = (
        <>
            <Icon
                className={cn('size-4 shrink-0', KIND_ACCENT[step.kind])}
                aria-hidden
            />

            <span className="text-foreground min-w-0 flex-1 text-sm font-semibold">
                {step.label}
            </span>

            <span
                className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap',
                    PLACE_CLASS[owner ?? 'cycle'],
                )}
            >
                {placeLabel}
            </span>

            {actor && (
                <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-[10px] font-semibold tracking-wide uppercase">
                    <span
                        className={cn(
                            'size-1.5 rounded-full',
                            ACTOR_DOT[actor],
                        )}
                        aria-hidden
                    />
                    {ACTOR_LABEL[actor]}
                </span>
            )}

            {step.readiness && <ReadinessBadge value={step.readiness} />}
        </>
    );

    if (!hasDetails) {
        return (
            <li className="bg-card flex items-center gap-2 rounded-lg border px-3 py-2">
                {head}
            </li>
        );
    }

    return (
        <li>
            <details className="group bg-card rounded-lg border">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
                    {head}
                    <ChevronRight
                        className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-90"
                        aria-hidden
                    />
                </summary>

                <div className="space-y-2.5 border-t px-3 py-2.5">
                    {step.hint && (
                        <p className="text-muted-foreground text-xs leading-snug">
                            {step.hint}
                        </p>
                    )}

                    {step.systemDoes && (
                        <ul className="text-foreground/85 space-y-1 text-xs leading-relaxed">
                            {step.systemDoes.map(item => (
                                <li key={item} className="flex gap-2">
                                    <span
                                        className="bg-primary mt-1.5 size-1 shrink-0 rounded-full"
                                        aria-hidden
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}

                    {step.branches && (
                        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            {step.branches.map(branch => (
                                <FlowBranchCard
                                    key={branch.id}
                                    branch={branch}
                                    exitActor={
                                        branch.exitId
                                            ? exitActors.get(branch.exitId)
                                            : undefined
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </details>
        </li>
    );
};
