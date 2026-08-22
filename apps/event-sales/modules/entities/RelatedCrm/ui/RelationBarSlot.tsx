'use client';

import { FC } from 'react';
import type { RelationBarItem } from '../lib/relations-bar';
import { dealAmount } from '../lib/stage-view';
import { DealStageBar } from './DealStageBar';
import { LeadStageBar } from './LeadStageBar';

interface RelationBarSlotProps {
    item: RelationBarItem;
    /** Подписать полоску названием и стадией (главная — да, миниатюры — нет). */
    withLabel?: boolean;
    className?: string;
}

/**
 * Одна полоска строки связей — сделка или заявка.
 *
 * Оба вида рисуются одинаково устроенными шкалами, и выбор между ними —
 * единственное отличие; раньше эта развилка была скопирована в главную
 * полоску и в миниатюры по отдельности.
 */
export const RelationBarSlot: FC<RelationBarSlotProps> = ({
    item,
    withLabel,
    className,
}) =>
    item.kind === 'deal' && item.deal ? (
        <DealStageBar
            stage={item.deal.stage}
            title={item.deal.title}
            note={dealAmount(item.deal.opportunity)}
            withLabel={withLabel}
            className={className}
        />
    ) : (
        <LeadStageBar
            statusId={item.lead?.statusId}
            semantic={item.lead?.statusSemanticId}
            title={item.title}
            withLabel={withLabel}
            className={className}
        />
    );
