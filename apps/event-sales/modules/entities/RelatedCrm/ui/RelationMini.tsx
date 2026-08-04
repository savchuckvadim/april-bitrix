'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { TaskRelation } from '../lib/resolve-task-relation';
import { getLeadStatusView } from '../lib/lead-status-view';
import { StageMini } from './StageMini';

interface RelationMiniProps extends TaskRelation {
    className?: string;
}

/**
 * На чём висит дело — одной строкой.
 *
 * Сделка показывается миниатюрой воронки (сегменты + название стадии), лид —
 * бейджем семантики: у лида воронки в нашем понимании нет, только «в работе /
 * успех / провал», и рисовать ему сегменты значило бы придумать шкалу.
 *
 * Связи нет — не рисуем ничего. Пустая строка-заглушка на карточке дела съела
 * бы место ради сообщения «связи нет», которое никому не нужно.
 */
export const RelationMini: FC<RelationMiniProps> = ({
    deal,
    lead,
    className,
}) => {
    if (!deal && !lead) return null;

    if (deal) {
        return <StageMini stage={deal.stage} className={className} />;
    }

    const status = getLeadStatusView(lead!.statusSemanticId);

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
                {lead!.title}
            </span>
        </div>
    );
};
