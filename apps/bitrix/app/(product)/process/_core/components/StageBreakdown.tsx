'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { ProcessModel } from '../types';
import { StageBreakdownRow } from './StageBreakdownRow';

interface StageBreakdownProps {
    model: ProcessModel;
    className?: string;
}

/**
 * Что происходит на каждой стадии воронки.
 *
 * Это ответ на «покажи процесс так, чтобы понял даже ребёнок»: список стадий
 * сверху вниз, каждая строка читается целиком без раскрытия — где идёт работа,
 * кто её делает, что там происходит. Нужны подробности — стадия разворачивается
 * в подпроцесс.
 *
 * Всё содержимое выводится из модели, поэтому крутилки и ответы на вопросы
 * меняют этот блок так же, как и хребет.
 */
export const StageBreakdown: FC<StageBreakdownProps> = ({
    model,
    className,
}) => (
    <section className={cn('flex flex-col gap-2', className)}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                2 · Что происходит на каждой стадии
            </h2>
            <p className="text-muted-foreground text-xs">
                строка читается сразу · нажмите, чтобы раскрыть подпроцесс
            </p>
        </div>

        <ol className="space-y-1.5">
            {model.stages.map((view, index) => (
                <StageBreakdownRow
                    key={view.stage.id}
                    view={view}
                    order={index + 1}
                    satellites={model.satellites.filter(
                        satellite => satellite.anchorStageId === view.stage.id,
                    )}
                    exits={model.exits.filter(exit =>
                        exit.fromStageIds?.includes(view.stage.id),
                    )}
                />
            ))}
        </ol>

        <p className="text-muted-foreground text-xs">
            С любой стадии клиент может уйти в{' '}
            {model.exits
                .filter(exit => !exit.fromStageIds)
                .map(exit => `«${exit.label}»`)
                .join(' или ')}
            .
        </p>
    </section>
);
