'use client';

import type { FC } from 'react';
import { Link2 } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { ProcessSatellite } from '../types';
import { ReadinessBadge } from './ReadinessBadge';

/** Содержимое модалки параллельной воронки: её лестница и связь с основной. */
export const SatelliteDetail: FC<{ satellite: ProcessSatellite }> = ({
    satellite,
}) => (
    <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px]">
                {satellite.categoryCode}
            </Badge>
            <ReadinessBadge value={satellite.readiness} />
        </div>

        <section>
            <h3 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Лестница воронки
            </h3>
            <ol className="mt-2 space-y-1.5">
                {satellite.stages.map((stage, index) => (
                    <li
                        key={stage.id}
                        className={cn(
                            'flex items-center gap-3 rounded-lg border px-3 py-2',
                            stage.isTerminal
                                ? 'text-muted-foreground border-dashed'
                                : 'border-primary/30',
                        )}
                    >
                        <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">
                            {index + 1}
                        </span>
                        <span className="text-foreground flex-1 text-sm font-medium">
                            {stage.label}
                        </span>
                        <span className="text-muted-foreground/70 font-mono text-[11px]">
                            {stage.id}
                        </span>
                        {stage.isTerminal && (
                            <Badge
                                variant="outline"
                                className="text-muted-foreground border-dashed text-[10px]"
                            >
                                финал
                            </Badge>
                        )}
                    </li>
                ))}
            </ol>
        </section>

        <section className="bg-muted/40 rounded-xl p-3">
            <h3 className="text-foreground flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                <Link2 className="text-primary h-3.5 w-3.5" aria-hidden />
                Связь с основной воронкой
            </h3>
            <p className="text-foreground/90 mt-1.5 text-sm leading-relaxed">
                {satellite.link}
            </p>
        </section>
    </div>
);
