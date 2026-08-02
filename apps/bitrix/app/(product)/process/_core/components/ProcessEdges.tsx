'use client';

import type { FC } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { ACTOR_LABEL } from '../lib/actor.util';
import type { ProcessEntryPoint, ProcessExit } from '../types';
import { ReadinessBadge } from './ReadinessBadge';

const EXIT_TONE: Record<ProcessExit['tone'], string> = {
    junk: 'border-muted-foreground/40 text-muted-foreground',
    fail: 'border-destructive/50 text-destructive',
    handover: 'border-warning/50 text-warning',
    duplicate: 'border-muted-foreground/40 text-muted-foreground',
};

interface ProcessEdgesProps {
    entryPoints: ProcessEntryPoint[];
    /** Съезды берём из модели: часть из них убирают ответы на вопросы. */
    exits: ProcessExit[];
    className?: string;
}

/**
 * Края маршрута: чем процесс начинается и чем может закончиться, кроме продажи.
 *
 * Это ответ на «всегда можно свернуть не туда»: съезды нарисованы явно, а не
 * спрятаны в развилках схемы.
 */
export const ProcessEdges: FC<ProcessEdgesProps> = ({
    entryPoints,
    exits,
    className,
}) => (
    <section className={cn('grid gap-3 lg:grid-cols-2', className)}>
        <GlassCard intensity="soft" className="rounded-xl border p-3">
            <h2 className="text-foreground flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                <LogIn className="text-primary h-4 w-4" aria-hidden />
                Как клиент попадает в работу
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
                Любой вход заканчивается одним и тем же: срабатывает хук, и
                менеджер получает сущность вместе с задачей.
            </p>

            <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {entryPoints.map(entry => (
                    <li
                        key={entry.id}
                        title={entry.hint}
                        className="border-primary/40 text-foreground/80 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                    >
                        {entry.label}
                        <ReadinessBadge value={entry.readiness} />
                    </li>
                ))}
            </ul>
        </GlassCard>

        <GlassCard intensity="soft" className="rounded-xl border p-3">
            <h2 className="text-foreground flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                <LogOut className="text-destructive h-4 w-4" aria-hidden />
                Куда можно свернуть
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
                Продажа — не единственный финал. Съезд с маршрута тоже нужно
                оформить, иначе клиент повиснет.
            </p>

            <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {exits.map(exit => (
                    <li
                        key={exit.id}
                        title={exit.hint}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
                            EXIT_TONE[exit.tone],
                        )}
                    >
                        {exit.label}
                        {exit.actor && (
                            <span className="text-muted-foreground/80 text-[10px] whitespace-nowrap">
                                решает {ACTOR_LABEL[exit.actor].toLowerCase()}
                            </span>
                        )}
                        <ReadinessBadge value={exit.readiness} />
                    </li>
                ))}
            </ul>
        </GlassCard>

        {/*
         * Отказ и буфер — не два разных конца, а одна петля. Без этой строки
         * читатель видит только «выход» и не понимает, что компания вернётся.
         */}
        <p className="text-muted-foreground lg:col-span-2 text-xs">
            Круг замыкается: отказ уводит компанию в буфер отказников, а оттуда
            она возвращается в холодный обзвон — уже к другому менеджеру.
        </p>
    </section>
);
