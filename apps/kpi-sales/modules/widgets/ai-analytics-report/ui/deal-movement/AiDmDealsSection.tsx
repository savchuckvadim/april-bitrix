'use client';

import { useMemo } from 'react';
import { Pager, SectionCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    AI_DEAL_MOVEMENT_PAGE_SIZES,
    type AiDealMovementStatuses,
} from '@/modules/entities/ai-analytics';
import type { AiDmDealsState } from '../../hooks/use-ai-dm-deals';
import type { AiDmNameOf } from '../../hooks/use-ai-dm-name';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import {
    aiDmDealsTitles,
    aiDmHasDealsFilter,
    aiDmLimitedNote,
    aiDmManagerOptions,
    aiDmStatusOptions,
} from '../../lib/deal-movement/ai-deal-movement-deals.util';
import { aiDmAsOf } from '../../lib/deal-movement/ai-deal-movement-format.util';
import { aiDmSortManagers } from '../../lib/deal-movement/ai-deal-movement-status.util';
import { AiQueuedState } from '../components/AiQueuedState';
import { AiDmDealsTable } from './AiDmDealsTable';
import { AiDmDealsToolbar } from './AiDmDealsToolbar';
import { AiDmLimitedNote } from './AiDmLimitedNote';
import { AiDmSkeleton } from './AiDmSkeleton';

const T = AI_DEAL_MOVEMENT_TEXT.deals;

interface AiDmDealsSectionProps {
    deals: AiDmDealsState;
    /** Обзор: менеджеры и подписи статусов для фильтров; null — грузится. */
    statuses: AiDealMovementStatuses | null;
    nameOf: AiDmNameOf;
}

/**
 * «Проблемные сделки» последней ночи: фильтры, таблица, «показаны 30 из
 * 48» по группам и страницы. Списка ещё нет — пояснение сервера.
 */
export const AiDmDealsSection = ({ deals, statuses, nameOf }: AiDmDealsSectionProps) => {
    const data = deals.data;
    const titles = useMemo(
        () => aiDmDealsTitles(statuses?.department ?? [], data?.items ?? []),
        [statuses, data],
    );
    const managerOptions = useMemo(
        () =>
            aiDmManagerOptions(
                aiDmSortManagers(statuses?.managers ?? []).map(item => item.managerId),
                deals.filter.managerId,
                managerId => nameOf(managerId),
            ),
        [statuses, deals.filter.managerId, nameOf],
    );
    const statusOptions = useMemo(
        () => aiDmStatusOptions(statuses?.department ?? []),
        [statuses],
    );
    const limited = useMemo(
        () => aiDmLimitedNote(data?.groups ?? [], managerId => nameOf(managerId), titles),
        [data, nameOf, titles],
    );

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description}
            wrapActions
            actions={
                <AiDmDealsToolbar
                    managerOptions={managerOptions}
                    managerId={deals.filter.managerId}
                    onManagerChange={deals.setManager}
                    statusOptions={statusOptions}
                    statuses={deals.filter.statuses}
                    onStatusesChange={deals.setStatuses}
                    canReset={aiDmHasDealsFilter(deals.filter)}
                    onReset={deals.reset}
                />
            }
        >
            {deals.status === 'error' ? (
                <AiQueuedState
                    status="error"
                    jobStatus={null}
                    error={deals.error}
                    loadingText=""
                    errorFallback={AI_DEAL_MOVEMENT_TEXT.state.fallback}
                    onRetry={deals.retry}
                />
            ) : !data ? (
                <AiDmSkeleton rows={6} />
            ) : (
                <div
                    aria-busy={deals.status === 'loading'}
                    className={cn('space-y-3', deals.status === 'loading' && 'opacity-60')}
                >
                    {data.day && (
                        <p className="text-xs text-muted-foreground">{aiDmAsOf(data.day)}</p>
                    )}
                    {data.note && <p className="text-sm text-muted-foreground">{data.note}</p>}
                    {data.items.length > 0 ? (
                        <AiDmDealsTable
                            items={data.items}
                            nameOf={nameOf}
                            oneManager={deals.filter.managerId !== null}
                        />
                    ) : (
                        data.day && <p className="py-2 text-xs text-muted-foreground">{T.empty}</p>
                    )}
                    <AiDmLimitedNote note={limited} perGroup={data.perGroup} />
                    {data.total > 0 && (
                        <Pager
                            page={data.page}
                            pageSize={data.pageSize}
                            total={data.total}
                            loading={deals.status === 'loading'}
                            pageSizes={AI_DEAL_MOVEMENT_PAGE_SIZES}
                            onPageChange={deals.setPage}
                            onPageSizeChange={deals.setPageSize}
                        />
                    )}
                </div>
            )}
        </SectionCard>
    );
};
