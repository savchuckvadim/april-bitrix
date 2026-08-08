'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { RelatedStage } from '../model';
import { stagePositionLabel } from '../lib/stage-view';
import { DealStageBar } from './DealStageBar';

interface StageMiniProps {
    stage: RelatedStage;
    /** Название сущности — уходит в тултип полоски. */
    title?: string;
    /** Доп. строка тултипа (сумма). */
    note?: string | null;
    className?: string;
}

/**
 * Компактная миниатюра стадии: строка «название · позиция» + та же полоска
 * стадий, что в карточках дел (DealStageBar) — одна компонента на всё
 * приложение, поэтому и палитра везде одна.
 */
export const StageMini: FC<StageMiniProps> = ({
    stage,
    title,
    note,
    className,
}) => {
    const position = stagePositionLabel(stage);

    return (
        <div className={cn('flex min-w-0 flex-col', className)}>
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

            <DealStageBar stage={stage} title={title} note={note} />
        </div>
    );
};
