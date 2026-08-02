'use client';

import type { FC } from 'react';
import { Cog } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { SimLogEntry } from '../../lib/simulator.util';

interface SimLogProps {
    log: SimLogEntry[];
    className?: string;
}

/**
 * Что система сделала в ответ на каждый отчёт.
 *
 * Это главный аргумент продукта, поэтому он показан буквально: менеджер
 * заполнил одну форму — вот список того, что за него сделали.
 */
export const SimLog: FC<SimLogProps> = ({ log, className }) => {
    if (log.length === 0) {
        return (
            <p
                className={cn(
                    'text-muted-foreground rounded-xl border border-dashed p-4 text-xs',
                    className,
                )}
            >
                Здесь появится всё, что система сделает за вас после отправки
                отчёта.
            </p>
        );
    }

    return (
        <ol className={cn('space-y-2', className)}>
            {[...log].reverse().map((entry, index) => (
                <li key={entry.id} className="bg-card rounded-xl border p-3">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                            {log.length - index}
                        </span>
                        <p className="text-foreground text-sm font-bold">
                            {entry.action}
                        </p>
                        <span className="text-muted-foreground text-xs">
                            {entry.stageLabel} · {entry.place}
                        </span>
                    </div>

                    <p className="text-primary mt-2 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                        <Cog className="size-3" aria-hidden />
                        Система сделала сама
                    </p>

                    <ul className="text-foreground/85 mt-1 space-y-1 text-xs leading-relaxed">
                        {entry.systemActions.map(action => (
                            <li key={action} className="flex gap-2">
                                <span
                                    className="bg-primary mt-1.5 size-1 shrink-0 rounded-full"
                                    aria-hidden
                                />
                                {action}
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ol>
    );
};
