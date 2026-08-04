'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { RelatedStage } from '../model';
import {
    stageColor,
    stagePositionLabel,
    stageSegments,
} from '../lib/stage-view';

interface StageMiniProps {
    stage: RelatedStage;
    className?: string;
}

/**
 * Компактная миниатюра стадии: ряд сегментов + название.
 *
 * Занимает одну строку — на экране таких строк десятки, и каждая лишняя
 * высота умножается на число сделок. Если портал не отдал порядок стадии,
 * сегменты не рисуем вовсе: показать позицию наугад хуже, чем не показать.
 */
export const StageMini: FC<StageMiniProps> = ({ stage, className }) => {
    const segments = stageSegments(stage);
    const color = stageColor(stage);
    const position = stagePositionLabel(stage);

    return (
        <div className={cn('flex min-w-0 items-center gap-2', className)}>
            {segments.length > 0 && (
                <span
                    className="flex shrink-0 items-center gap-px"
                    role="img"
                    aria-label={position ? `Стадия ${position}` : undefined}
                >
                    {segments.map((segment, index) => (
                        <span
                            key={index}
                            className={cn(
                                'h-1.5 w-2 rounded-[1px]',
                                segment.isFilled ? 'bg-foreground' : 'bg-muted',
                                segment.isCurrent && 'h-2.5',
                            )}
                            style={
                                segment.isFilled && color
                                    ? { backgroundColor: color }
                                    : undefined
                            }
                        />
                    ))}
                </span>
            )}

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
    );
};
