'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { ACTOR_DOT, ACTOR_LEGEND } from '../lib/actor.util';
import type { ProcessModel, StageView } from '../types';
import { CoverageBand } from './CoverageBand';
import { StageStation } from './StageStation';

interface SpineCanvasProps {
    model: ProcessModel;
    onSelectStage: (view: StageView) => void;
    className?: string;
}

/**
 * Хребет процесса: один рельс от первой стадии до продажи, над ним полоса
 * лида, под ним полоса сделки. Полосы растут навстречу друг другу и могут
 * наложиться — там, где они накрывают одни и те же станции, стадию держат обе
 * сущности сразу.
 *
 * Координат в DOM не измеряем: и станции, и полосы считаются от одной сетки
 * колонок, поэтому они всегда совпадают по границам.
 */
export const SpineCanvas: FC<SpineCanvasProps> = ({
    model,
    onSelectStage,
    className,
}) => {
    const total = model.stages.length;
    const leadCount = model.leadEnd + 1;
    const dealCount = total - model.dealStart;

    return (
        <section
            aria-label="Хребет процесса продажи"
            className={cn('flex w-full flex-col gap-3', className)}
        >
            <CoverageBand
                label="Лид"
                from={0}
                count={leadCount}
                total={total}
                direction="forward"
                color="var(--event-lead)"
            />

            <div className="relative">
                {/* Рельс — проходит через центр станций. */}
                <span
                    aria-hidden
                    className="bg-border absolute top-[13px] right-0 left-0 h-0.5"
                />

                <ol
                    className="grid gap-1.5"
                    style={{
                        gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`,
                    }}
                >
                    {model.stages.map((view, index) => (
                        <li key={view.stage.id} className="min-w-0">
                            <StageStation
                                view={view}
                                order={index}
                                onSelect={onSelectStage}
                            />
                        </li>
                    ))}
                </ol>
            </div>

            <CoverageBand
                label="Сделка"
                from={model.dealStart}
                count={dealCount}
                total={total}
                direction="backward"
                color="var(--primary)"
            />

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {ACTOR_LEGEND.map(item => (
                    <span
                        key={item.actor}
                        className="flex items-center gap-1.5"
                    >
                        <span
                            className={cn(
                                'size-2 rounded-full',
                                ACTOR_DOT[item.actor],
                            )}
                            aria-hidden
                        />
                        {item.label}
                    </span>
                ))}
                <span className="ml-auto">
                    полосатая станция — стадию держат оба контура · пунктирная —
                    не держит никто
                </span>
            </div>
        </section>
    );
};
