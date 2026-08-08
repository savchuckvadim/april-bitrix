'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { StageProgress } from '@workspace/april-ui';
import type { RelatedStage } from '../../model';
import { stageColor, stageProgress } from '@/modules/entities/RelatedCrm';

interface StageBarProps {
    stage: RelatedStage;
    className?: string;
}

/**
 * Узкая полоска стадии сделки: точка портального цвета + название + градиентный
 * стадийный прогресс (StageProgress, рампа --deal-stage-* — как везде).
 * Если стадии нет в настройках портала, полоска не рисуется: показать
 * «прогресс» наугад хуже, чем не показать.
 */
export const StageBar: FC<StageBarProps> = ({ stage, className }) => {
    const progress = stageProgress(stage);
    const color = stageColor(stage);

    return (
        <div className={cn('min-w-0 space-y-1', className)}>
            <div className="flex items-baseline gap-1.5">
                <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full bg-muted-foreground"
                    style={color ? { backgroundColor: color } : undefined}
                />
                <span className="min-w-0 truncate text-xs font-medium text-foreground">
                    {stage.title ?? stage.bitrixId}
                </span>
                {stage.categoryTitle && (
                    <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                        {stage.categoryTitle}
                    </span>
                )}
            </div>

            {progress !== null && (
                <div
                    role="img"
                    aria-label={`Стадия ${stage.order! + 1} из ${stage.total}`}
                >
                    <StageProgress
                        value={progress}
                        total={stage.total ?? undefined}
                    />
                </div>
            )}
        </div>
    );
};
