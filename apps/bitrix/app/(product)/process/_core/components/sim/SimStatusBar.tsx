'use client';

import type { FC } from 'react';
import { MapPin, UserRound } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { findEventType } from '../../constants/sim-events';
import { ACTOR_DOT, ACTOR_LABEL } from '../../lib/actor.util';
import type { SimState } from '../../lib/simulator.util';
import type { StageOwner, StageView } from '../../types';

const PLACE_CLASS: Record<StageOwner, string> = {
    lead: 'border-event-lead/50 bg-event-lead/10 text-event-lead',
    deal: 'border-primary/50 bg-primary/10 text-primary',
    both: 'border-warning/50 bg-warning/10 text-warning',
    none: 'border-destructive/50 bg-destructive/10 text-destructive',
};

interface SimStatusBarProps {
    state: SimState;
    stageView: StageView;
    place: string;
}

/**
 * Где вы сейчас и кто вы.
 *
 * Самый частый вопрос при разборе процесса — «а я сейчас в лиде или в сделке?».
 * Поэтому строка висит всегда и обновляется на каждом шаге.
 */
export const SimStatusBar: FC<SimStatusBarProps> = ({
    state,
    stageView,
    place,
}) => {
    const nextTask = state.tasks[0];
    const planned = findEventType(nextTask?.eventCode ?? '');

    return (
        <GlassCard intensity="strong" className="rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <div>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        Вы сейчас
                    </p>
                    <p className="mt-1 flex items-center gap-2">
                        <MapPin className="text-primary size-4" aria-hidden />
                        <span
                            className={cn(
                                'rounded-full border px-2.5 py-0.5 text-sm font-bold',
                                PLACE_CLASS[stageView.owner],
                            )}
                        >
                            {place}
                        </span>
                    </p>
                </div>

                <div>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        Вы
                    </p>
                    <p className="text-foreground mt-1 flex items-center gap-2 font-bold">
                        <UserRound
                            className="text-muted-foreground size-4"
                            aria-hidden
                        />
                        <span
                            className={cn(
                                'size-2 rounded-full',
                                ACTOR_DOT[stageView.actor],
                            )}
                            aria-hidden
                        />
                        {ACTOR_LABEL[stageView.actor]}
                    </p>
                </div>

                <div>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        Стадия
                    </p>
                    <p className="text-foreground mt-1 font-bold">
                        {stageView.stage.label}
                    </p>
                </div>

                <div>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        Клиент
                    </p>
                    <p className="text-foreground mt-1 font-bold">
                        {state.company || '—'}
                    </p>
                    {state.companyKnown === false && (
                        <p className="text-warning mt-0.5 text-[11px] font-semibold">
                            компания не определена — выяснить звонком
                        </p>
                    )}
                </div>

                {planned && (
                    <div className="ml-auto">
                        <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            Дел на сегодня: {state.tasks.length}
                        </p>
                        <p className="text-action mt-1 font-bold">
                            {planned.emoji && `${planned.emoji} `}
                            {planned.label}
                            {state.tasks.length > 1 && (
                                <span className="text-muted-foreground font-normal">
                                    {' '}
                                    и ещё {state.tasks.length - 1}
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {stageView.owner === 'both' && (
                <p className="text-warning mt-3 text-xs">
                    Эта стадия живёт сразу в лиде и в сделке. Форма «Звонки»
                    одна — её можно открыть из обеих карточек, и она сама сводит
                    статусы между ними.
                </p>
            )}
        </GlassCard>
    );
};
