'use client';

import type { FC } from 'react';
import { BarChart3, ChevronRight, Lock, User, Wrench } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { ACTOR_DOT, ACTOR_LABEL } from '../lib/actor.util';
import type {
    ProcessExit,
    ProcessSatellite,
    StageOwner,
    StageView,
} from '../types';
import { ReadinessBadge } from './ReadinessBadge';

const PLACE_LABEL: Record<StageOwner, string> = {
    lead: 'в лиде',
    deal: 'в сделке',
    both: 'в лиде и сделке',
    none: 'нигде',
};

/** Цвет чипа сущности повторяет полосы покрытия на хребте. */
const PLACE_CLASS: Record<StageOwner, string> = {
    lead: 'border-event-lead/50 bg-event-lead/10 text-event-lead',
    deal: 'border-primary/50 bg-primary/10 text-primary',
    both: 'border-warning/50 bg-warning/10 text-warning',
    none: 'border-destructive/50 bg-destructive/10 text-destructive',
};

interface StageBreakdownRowProps {
    view: StageView;
    order: number;
    /** Воронки-спутники, которые включаются на этой стадии. */
    satellites: ProcessSatellite[];
    /** Съезды, возможные именно отсюда. */
    exits: ProcessExit[];
}

/**
 * Одна стадия воронки в разборе «что здесь происходит».
 *
 * Свёрнутая строка отвечает на три вопроса сразу: где идёт работа, кто её
 * делает и что на этой стадии вообще происходит. Развёрнутая — показывает
 * подпроцесс: действия человека, работу автоматики, параллельные воронки и
 * съезды с маршрута.
 */
export const StageBreakdownRow: FC<StageBreakdownRowProps> = ({
    view,
    order,
    satellites,
    exits,
}) => {
    const { stage, owner, actor } = view;

    return (
        <li>
            <details className="group bg-card rounded-lg border">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
                    <span className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        {order}
                    </span>

                    <span className="text-foreground w-32 shrink-0 text-sm font-bold">
                        {stage.label}
                    </span>

                    <span
                        className={cn(
                            'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap',
                            PLACE_CLASS[owner],
                        )}
                    >
                        {PLACE_LABEL[owner]}
                    </span>

                    <span className="text-muted-foreground flex w-28 shrink-0 items-center gap-1 text-[10px] font-semibold tracking-wide uppercase">
                        <span
                            className={cn(
                                'size-1.5 shrink-0 rounded-full',
                                ACTOR_DOT[actor],
                            )}
                            aria-hidden
                        />
                        {ACTOR_LABEL[actor]}
                    </span>

                    {/* Верхнеуровневый смысл стадии — читается без раскрытия. */}
                    <span className="text-muted-foreground hidden min-w-0 flex-1 truncate text-xs lg:block">
                        {stage.managerDoes[0]}
                    </span>

                    {view.writesKpi && (
                        <BarChart3
                            className="text-success size-3.5 shrink-0"
                            aria-label="работа с этой стадии попадает в отчётность"
                        />
                    )}
                    {view.isBlockedForLead && (
                        <Lock
                            className="text-warning size-3.5 shrink-0"
                            aria-label="регламент не пускает сюда лид"
                        />
                    )}

                    <ChevronRight
                        className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-90"
                        aria-hidden
                    />
                </summary>

                <div className="grid gap-4 border-t px-3 py-3 lg:grid-cols-2">
                    <section>
                        <h4 className="text-foreground flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase">
                            <User className="size-3.5" aria-hidden />
                            Что делает человек
                        </h4>
                        <ul className="text-foreground/85 mt-1.5 space-y-1 text-xs leading-relaxed">
                            {stage.managerDoes.map(item => (
                                <li key={item} className="flex gap-2">
                                    <span
                                        className="bg-muted-foreground mt-1.5 size-1 shrink-0 rounded-full"
                                        aria-hidden
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-primary flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase">
                            <Wrench className="size-3.5" aria-hidden />
                            Что делает система сама
                        </h4>
                        <ul className="text-foreground/85 mt-1.5 space-y-1 text-xs leading-relaxed">
                            {stage.systemDoes.map(item => (
                                <li key={item} className="flex gap-2">
                                    <span
                                        className="bg-primary mt-1.5 size-1 shrink-0 rounded-full"
                                        aria-hidden
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {satellites.length > 0 && (
                        <section className="lg:col-span-2">
                            <h4 className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                                Здесь система сама включает параллельную воронку
                            </h4>
                            <div className="mt-1.5 space-y-1.5">
                                {satellites.map(satellite => (
                                    <p
                                        key={satellite.id}
                                        className="text-foreground/85 text-xs"
                                    >
                                        <span className="font-semibold">
                                            {satellite.label}
                                        </span>{' '}
                                        — {satellite.summary}{' '}
                                        <span className="text-muted-foreground">
                                            {satellite.stages
                                                .map(item => item.label)
                                                .join(' → ')}
                                        </span>
                                    </p>
                                ))}
                            </div>
                        </section>
                    )}

                    {exits.length > 0 && (
                        <section className="lg:col-span-2">
                            <h4 className="text-destructive text-[11px] font-bold tracking-widest uppercase">
                                Отсюда можно свернуть
                            </h4>
                            <ul className="mt-1.5 flex flex-wrap gap-1.5">
                                {exits.map(exit => (
                                    <li
                                        key={exit.id}
                                        title={exit.hint}
                                        className="border-destructive/40 text-destructive flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]"
                                    >
                                        {exit.label}
                                        {exit.actor && (
                                            <span className="text-muted-foreground">
                                                решает{' '}
                                                {ACTOR_LABEL[
                                                    exit.actor
                                                ].toLowerCase()}
                                            </span>
                                        )}
                                        <ReadinessBadge
                                            value={exit.readiness}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </details>
        </li>
    );
};
