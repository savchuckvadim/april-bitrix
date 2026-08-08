'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { TaskRelation } from '../lib/resolve-task-relation';
import { getLeadStatusView } from '../lib/lead-status-view';
import { stageProgress } from '../lib/stage-view';
import { RelationDealBars } from './RelationDealBars';

interface RelationMiniProps extends TaskRelation {
    className?: string;
}

/**
 * Связи клиента в карточке дела.
 *
 * Открытые сделки показываются голыми полосками стадий (1–3 штуки, вся
 * информация в тултипах — см. RelationDealBars). Лид — бейджем семантики,
 * и только когда сделок нет: у лида воронки в нашем понимании нет, а стадии
 * заявки появятся на новых pbx-полях — тогда лид получит свою полоску.
 *
 * Связей нет — не рисуем ничего. Пустая строка-заглушка съела бы место ради
 * сообщения «связи нет», которое никому не нужно.
 */
export const RelationMini: FC<RelationMiniProps> = ({
    deals,
    lead,
    className,
}) => {
    // Ветка выбирается по РИСУЕМЫМ полоскам, а не по deals.length: сделка без
    // порядка стадии в слепке портала полоску не получает, и непустой массив
    // таких сделок иначе гасил бы и полоски, и лид-чип разом.
    const hasBars = deals.some(deal => stageProgress(deal.stage) !== null);

    if (hasBars) {
        return <RelationDealBars deals={deals} className={className} />;
    }

    if (!lead) return null;

    const status = getLeadStatusView(lead.statusSemanticId);

    return (
        <div className={cn('flex min-w-0 items-center gap-2', className)}>
            <span
                className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-[0.6875rem]',
                    status.className,
                )}
            >
                {status.label}
            </span>
            <span className="min-w-0 truncate text-xs text-muted-foreground">
                {lead.title}
            </span>
        </div>
    );
};
