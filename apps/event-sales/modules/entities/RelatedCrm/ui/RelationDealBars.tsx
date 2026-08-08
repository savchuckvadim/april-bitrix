'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { RelationDeal } from '../lib/resolve-task-relation';
import { stageProgress } from '../lib/stage-view';
import { stageEntityIdFromStageId } from '../lib/bound-deal-view';
import { useStageDicts } from '../lib/hooks/use-stage-dicts';
import { DealBar } from './DealBar';

interface RelationDealBarsProps {
    deals: RelationDeal[];
    className?: string;
}

/**
 * Стадии сделок — только полоски, весь текст в посегментных тултипах
 * (см. DealBar). Сделка без порядка стадии в настройках портала полоску
 * не получает (показать позицию наугад хуже, чем не показать) — такие
 * пропускаем целиком.
 */
export const RelationDealBars: FC<RelationDealBarsProps> = ({
    deals,
    className,
}) => {
    const dicts = useStageDicts(deals);

    const rows = deals
        .map(deal => ({ deal, progress: stageProgress(deal.stage) }))
        .filter((row): row is typeof row & { progress: number } =>
            row.progress !== null,
        );

    if (!rows.length) return null;

    return (
        <div className={cn('flex flex-col', className)}>
            {rows.map(({ deal, progress }) => (
                <DealBar
                    key={deal.id}
                    deal={deal}
                    progress={progress}
                    dict={dicts[stageEntityIdFromStageId(deal.stage.bitrixId)]}
                />
            ))}
        </div>
    );
};
