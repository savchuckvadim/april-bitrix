'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { RelatedStage } from '../../model';
import { stageColor, stageProgress } from '../../lib/candidate-view';

interface StageBarProps {
    stage: RelatedStage;
    className?: string;
}

/**
 * Узкая цветная полоска стадии сделки.
 *
 * Цвет и позиция берутся из настроек воронки портала (`IStage.color`,
 * `order`/`total`), а не из палитры фронта — менеджер видит ту же расцветку,
 * что и в своей воронке в Битриксе. Если стадии нет в настройках портала,
 * полоска не рисуется: показать «прогресс» наугад хуже, чем не показать.
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
                    className="h-1 w-full overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={`Стадия ${stage.order! + 1} из ${stage.total}`}
                >
                    <div
                        className="h-full rounded-full bg-muted-foreground transition-[width]"
                        style={{
                            width: `${Math.round(progress * 100)}%`,
                            ...(color ? { backgroundColor: color } : {}),
                        }}
                    />
                </div>
            )}
        </div>
    );
};
