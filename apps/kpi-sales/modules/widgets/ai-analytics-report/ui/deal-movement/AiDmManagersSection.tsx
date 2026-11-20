'use client';

import { useMemo } from 'react';
import { HintTooltip, SectionCard } from '@workspace/april-ui';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { AiDealMovementStatuses } from '@/modules/entities/ai-analytics';
import type { AiDmNameOf } from '../../hooks/use-ai-dm-name';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import {
    aiDmOrderedCells,
    aiDmSortManagers,
    aiDmStatusTitles,
} from '../../lib/deal-movement/ai-deal-movement-status.util';
import { AiDmManagerRow } from './AiDmManagerRow';
import { AiDmSkeleton } from './AiDmSkeleton';

const T = AI_DEAL_MOVEMENT_TEXT.managers;

interface AiDmManagersSectionProps {
    /** null — обзор ещё грузится. */
    statuses: AiDealMovementStatuses | null;
    nameOf: AiDmNameOf;
    /** Менеджер, чьи сделки сейчас в списке ниже. */
    selectedId: string | null;
    onPick: (managerId: string) => void;
}

/**
 * «Менеджеры»: статусы сделок каждого на последнюю ночь — число в ячейке,
 * сумма в подсказке; больше проблемных — выше. Клик по имени — фильтр
 * списка проблемных сделок.
 */
export const AiDmManagersSection = ({
    statuses,
    nameOf,
    selectedId,
    onPick,
}: AiDmManagersSectionProps) => {
    const titles = useMemo(
        () => aiDmStatusTitles(statuses?.department ?? []),
        [statuses],
    );
    const managers = useMemo(
        () => aiDmSortManagers(statuses?.managers ?? []),
        [statuses],
    );

    return (
        <SectionCard surface="glass" title={T.title} description={T.description}>
            {!statuses ? (
                <AiDmSkeleton rows={4} />
            ) : !managers.length ? (
                <p className="py-2 text-xs text-muted-foreground">{T.empty}</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{T.columns.manager}</TableHead>
                            {aiDmOrderedCells(statuses.department, titles).map(cell => (
                                <TableHead key={cell.status} className="text-right">
                                    {cell.title}
                                </TableHead>
                            ))}
                            <TableHead className="text-right">
                                <HintTooltip
                                    title={T.problemHint.title}
                                    lines={[...T.problemHint.lines]}
                                >
                                    <span className="cursor-help border-b border-dashed border-muted-foreground">
                                        {T.columns.problem}
                                    </span>
                                </HintTooltip>
                            </TableHead>
                            <TableHead className="text-right">{T.columns.problemSum}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {managers.map(manager => (
                            <AiDmManagerRow
                                key={manager.managerId}
                                manager={manager}
                                name={nameOf(manager.managerId, manager.managerName)}
                                titles={titles}
                                selected={manager.managerId === selectedId}
                                onPick={onPick}
                            />
                        ))}
                    </TableBody>
                </Table>
            )}
        </SectionCard>
    );
};
