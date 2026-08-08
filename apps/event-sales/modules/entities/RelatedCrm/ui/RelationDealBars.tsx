'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { RelationDeal } from '../lib/resolve-task-relation';
import { dealAmount, stageProgress } from '../lib/stage-view';
import { DealStageBar } from './DealStageBar';

interface RelationDealBarsProps {
    deals: RelationDeal[];
    className?: string;
}

/**
 * Стадии сделок карточки дела — только полоски, весь текст в тултипах
 * (DealStageBar). Сделка без порядка стадии в настройках портала полоску не
 * получает: показать позицию наугад хуже, чем не показать.
 */
export const RelationDealBars: FC<RelationDealBarsProps> = ({
    deals,
    className,
}) => {
    const rows = deals.filter(deal => stageProgress(deal.stage) !== null);
    if (!rows.length) return null;

    return (
        <div className={cn('flex flex-col', className)}>
            {rows.map(deal => (
                <DealStageBar
                    key={deal.id}
                    stage={deal.stage}
                    title={deal.title}
                    note={dealAmount(deal.opportunity)}
                    isMismatch={deal.isOutsideClientGraph}
                    withLabel
                />
            ))}
        </div>
    );
};
