'use client';

import type { FC } from 'react';
import { CornerDownRight, RefreshCw } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { ProcessDefinition, ProcessModel } from '../../types';

interface SimJourneyProps {
    definition: ProcessDefinition;
    model: ProcessModel;
    /** Где пользователь стоит прямо сейчас. */
    stageIndex: number;
    /** Пройденные стадии подсвечиваются иначе, чем будущие. */
    maxReachedIndex: number;
}

/**
 * Путь процесса слева направо: где вы были, где стоите и что впереди.
 *
 * Это не хребет со схемы: там стадии показаны как устройство процесса, здесь —
 * как маршрут одного клиента. Поэтому подписаны не только станции, но и то,
 * что с них можно свернуть, и то, куда путь возвращается.
 *
 * Ветвления и петли нарисованы под лентой, а не сбоку: любая попытка развести
 * их в стороны превращает ленту в схему метро, а её невозможно читать на ходу.
 */
export const SimJourney: FC<SimJourneyProps> = ({
    definition,
    model,
    stageIndex,
    maxReachedIndex,
}) => (
    <section aria-label="Путь процесса" className="min-w-0">
        <div className="-mx-1 overflow-x-auto px-1 pb-2">
            <ol className="flex min-w-max items-stretch gap-1">
                {model.stages.map((view, index) => {
                    const isNow = index === stageIndex;
                    const isPassed = index < stageIndex;
                    const isReachable = index <= maxReachedIndex;

                    return (
                        <li
                            key={view.stage.id}
                            className="flex items-stretch gap-1"
                        >
                            <div
                                aria-current={isNow ? 'step' : undefined}
                                className={cn(
                                    'flex w-28 flex-col rounded-lg border px-2.5 py-2 transition-colors',
                                    isNow &&
                                        'border-primary bg-primary/10 shadow-sm',
                                    isPassed && 'border-border/60 opacity-80',
                                    !isNow &&
                                        !isReachable &&
                                        'border-dashed opacity-45',
                                )}
                            >
                                <span
                                    aria-hidden
                                    className="h-1 w-8 rounded-full"
                                    style={{
                                        backgroundColor: view.stage.color,
                                    }}
                                />
                                <span
                                    className={cn(
                                        'mt-1.5 text-xs leading-tight',
                                        isNow
                                            ? 'text-foreground font-semibold'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {view.stage.label}
                                </span>

                                {isNow && (
                                    <span className="text-primary mt-1 text-[10px] font-semibold tracking-wide uppercase">
                                        вы здесь
                                    </span>
                                )}
                            </div>

                            {index < model.stages.length - 1 && (
                                <span
                                    aria-hidden
                                    className="bg-border my-auto h-px w-2 shrink-0"
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>

        {/*
         * Съезды и петли — то, чего в прямой ленте не видно, но без чего
         * процесс описан неправдой: из большинства стадий можно уйти вбок, а
         * отказ вообще возвращает клиента в начало.
         */}
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span className="flex items-center gap-1.5">
                <CornerDownRight className="size-3.5" aria-hidden />
                Свернуть можно почти с любой стадии:{' '}
                {model.exits.map(exit => exit.label).join(' · ')}
            </span>
            <span className="flex items-center gap-1.5">
                <RefreshCw className="size-3.5" aria-hidden />
                Отказ — не конец: компания уходит в буфер отказников и
                возвращается в «{definition.stages[0]?.label}»
            </span>
        </div>
    </section>
);
