'use client';

import type { FC } from 'react';
import { GlassCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { ProcessSatellite } from '../types';
import { ReadinessBadge } from './ReadinessBadge';

/** Цвет полосы над колонкой — приём канбана Битрикса. */
const ACCENT: Record<string, string> = {
    xo: 'bg-event-cold',
    presentation: 'bg-event-pres',
    tmc: 'bg-event-supply',
};

export interface SatelliteRailProps {
    satellites: ProcessSatellite[];
    onSelect: (satellite: ProcessSatellite) => void;
    className?: string;
}

/**
 * Воронки-спутники: они не ветки основного процесса, а отдельные жизни рядом
 * с ним. Показываем их канбаном Битрикса — заказчик узнаёт метафору мгновенно.
 */
export const SatelliteRail: FC<SatelliteRailProps> = ({
    satellites,
    onSelect,
    className,
}) => (
    <section className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-baseline gap-3">
            <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                Параллельные воронки
            </h2>
            <p className="text-muted-foreground text-xs">
                живут своей жизнью рядом с основной — это отдельные сделки, а не
                стадии
            </p>
        </div>

        <ul className="grid gap-3 md:grid-cols-3">
            {satellites.map(satellite => (
                <li key={satellite.id}>
                    <button
                        type="button"
                        onClick={() => onSelect(satellite)}
                        title="Открыть воронку целиком"
                        className="group h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-primary"
                    >
                        <GlassCard
                            intensity="soft"
                            className="flex h-full flex-col overflow-hidden rounded-xl border transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md"
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    'h-1.5 w-full',
                                    ACCENT[satellite.id] ?? 'bg-primary',
                                )}
                            />

                            <div className="flex min-h-0 flex-1 flex-col p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-foreground font-bold">
                                        {satellite.label}
                                    </h3>
                                    <ReadinessBadge
                                        value={satellite.readiness}
                                    />
                                </div>

                                <p className="text-muted-foreground mt-1 text-xs leading-snug">
                                    {satellite.summary}
                                </p>

                                <div className="mt-2.5 flex flex-wrap gap-1">
                                    {satellite.stages.map(stage => (
                                        <span
                                            key={stage.id}
                                            className={cn(
                                                'rounded-full border px-2 py-0.5 text-[10px] leading-tight',
                                                stage.isTerminal
                                                    ? 'text-muted-foreground border-dashed'
                                                    : 'border-primary/40 text-foreground/80',
                                            )}
                                        >
                                            {stage.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </button>
                </li>
            ))}
        </ul>
    </section>
);
