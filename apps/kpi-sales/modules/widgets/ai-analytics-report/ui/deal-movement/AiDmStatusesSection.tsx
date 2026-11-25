'use client';

import { useMemo } from 'react';
import { SectionCard, ToneBadge } from '@workspace/april-ui';
import type { AiDealMovementStatuses } from '@/modules/entities/ai-analytics';
import { ChartsGate } from '@/modules/shared';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { aiDmAsOf } from '../../lib/deal-movement/ai-deal-movement-format.util';
import {
    aiDmOrderedCells,
    aiDmStatusTitles,
} from '../../lib/deal-movement/ai-deal-movement-status.util';
import { AiDmNightsChart } from './AiDmNightsChart';
import { AiDmNotes } from './AiDmNotes';
import { AiDmSkeleton } from './AiDmSkeleton';
import { AiDmStatusCard } from './AiDmStatusCard';

const T = AI_DEAL_MOVEMENT_TEXT.statuses;

interface AiDmStatusesSectionProps {
    /** null — обзор ещё грузится. */
    statuses: AiDealMovementStatuses | null;
}

/**
 * «Статусы сделок отдела»: пять карточек на последнюю ночь периода,
 * динамика по ночам и пояснения сервера. Счёта за период нет — пояснения
 * без карточек.
 */
export const AiDmStatusesSection = ({ statuses }: AiDmStatusesSectionProps) => {
    const titles = useMemo(
        () => aiDmStatusTitles(statuses?.department ?? []),
        [statuses],
    );

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description}
            actions={
                statuses?.day ? (
                    <ToneBadge tone="muted" variant="soft" size="sm">
                        {aiDmAsOf(statuses.day)}
                    </ToneBadge>
                ) : null
            }
        >
            {!statuses ? (
                <AiDmSkeleton rows={3} />
            ) : (
                <div className="space-y-4">
                    {statuses.day ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                            {aiDmOrderedCells(statuses.department, titles).map(cell => (
                                <AiDmStatusCard key={cell.status} cell={cell} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{T.noSnapshot}</p>
                    )}
                    {statuses.day && (
                        <ChartsGate>
                            <AiDmNightsChart nights={statuses.nights} titles={titles} />
                        </ChartsGate>
                    )}
                    <AiDmNotes notes={statuses.notes} />
                </div>
            )}
        </SectionCard>
    );
};
