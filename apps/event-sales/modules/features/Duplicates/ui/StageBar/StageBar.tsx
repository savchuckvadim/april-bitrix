'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { RelatedStage } from '../../model';
import { DealStageBar, stageColor } from '@/modules/entities/RelatedCrm';

interface StageBarProps {
    stage: RelatedStage;
    /** Название сущности — уходит в тултип полоски. */
    title?: string;
    className?: string;
}

/**
 * Стадия сделки в карточке дубля: точка портального цвета + название +
 * общая полоска стадий (DealStageBar — та же, что в карточках дел и
 * связанных сделках).
 */
export const StageBar: FC<StageBarProps> = ({ stage, title, className }) => {
    const color = stageColor(stage);

    return (
        <div className={cn('min-w-0 space-y-0.5', className)}>
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

            <DealStageBar stage={stage} title={title} />
        </div>
    );
};
