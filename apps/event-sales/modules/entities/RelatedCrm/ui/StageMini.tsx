'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { StageProgress } from '@workspace/april-ui';
import type { RelatedStage } from '../model';
import { stagePositionLabel, stageProgress } from '../lib/stage-view';

interface StageMiniProps {
    stage: RelatedStage;
    className?: string;
}

/**
 * Компактная миниатюра стадии: строка «название · позиция» + очень тонкая
 * градиентная полоска пройденной воронки (StageProgress). Закрашенное —
 * пройденные стадии, пробел справа — сколько осталось.
 *
 * Если портал не отдал порядок стадии, полоску не рисуем вовсе: показать
 * позицию наугад хуже, чем не показать.
 */
export const StageMini: FC<StageMiniProps> = ({ stage, className }) => {
    const progress = stageProgress(stage);
    const position = stagePositionLabel(stage);

    return (
        <div className={cn('flex min-w-0 flex-col gap-1', className)}>
            <div className="flex min-w-0 items-baseline gap-2">
                <span className="min-w-0 truncate text-xs text-muted-foreground">
                    {stage.title ?? stage.bitrixId}
                    {stage.categoryTitle ? ` · ${stage.categoryTitle}` : ''}
                </span>
                {position && (
                    <span className="shrink-0 text-[0.6875rem] text-muted-foreground/70">
                        {position}
                    </span>
                )}
            </div>

            {progress !== null && (
                <StageProgress
                    value={progress}
                    total={stage.total ?? undefined}
                    shimmer
                />
            )}
        </div>
    );
};
