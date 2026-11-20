'use client';

import { useCallback, useMemo, useRef } from 'react';
import { SectionCard } from '@workspace/april-ui';
import { useAiDmDeals } from '../../hooks/use-ai-dm-deals';
import { useAiDmNameOf } from '../../hooks/use-ai-dm-name';
import { useAiDmOverview } from '../../hooks/use-ai-dm-overview';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { aiDmKnownNames } from '../../lib/deal-movement/ai-deal-movement-format.util';
import { AiQueuedState } from '../components/AiQueuedState';
import { AiDmDealsSection } from '../deal-movement/AiDmDealsSection';
import { AiDmForbidden } from '../deal-movement/AiDmForbidden';
import { AiDmHonestySection } from '../deal-movement/AiDmHonestySection';
import { AiDmManagersSection } from '../deal-movement/AiDmManagersSection';
import { AiDmMatrixSection } from '../deal-movement/AiDmMatrixSection';
import { AiDmStatusesSection } from '../deal-movement/AiDmStatusesSection';

const T = AI_DEAL_MOVEMENT_TEXT;

/**
 * Подвкладка «Движение сделок» (руководителям и суперпользователю):
 * статусы отдела с динамикой по ночам, менеджеры, проблемные сделки
 * последней ночи, матрица «оценка звонка × продвижение» и честность
 * оценок AI. Период и менеджеры — из фильтра отчёта; данные — только из
 * двух ручек движения сделок, пересчёт отчёта отсюда не запускается.
 * Клик по менеджеру в таблице открывает его проблемные сделки ниже.
 */
export const AiDealMovementTab = () => {
    const overview = useAiDmOverview();
    const deals = useAiDmDeals(overview.managerKey);
    const { setManager } = deals;
    const dealsRef = useRef<HTMLDivElement>(null);

    // Новый период — скелеты, а не цифры прошлого периода.
    const data = overview.status === 'ready' ? overview.data : null;
    const knownNames = useMemo(
        () =>
            aiDmKnownNames([
                data?.statuses.managers ?? [],
                data?.matrix.managers ?? [],
                data?.honesty.managers ?? [],
                deals.data?.items ?? [],
            ]),
        [data, deals.data],
    );
    const nameOf = useAiDmNameOf(knownNames);

    const openManagerDeals = useCallback(
        (managerId: string) => {
            setManager(managerId);
            dealsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        [setManager],
    );

    if (overview.forbidden || deals.forbidden) return <AiDmForbidden />;
    if (!overview.hasRequest) {
        return (
            <SectionCard surface="glass" title={T.statuses.title}>
                <p className="py-2 text-sm text-muted-foreground">{T.state.noPeriod}</p>
            </SectionCard>
        );
    }

    return (
        <div className="space-y-4">
            {overview.status === 'error' ? (
                <SectionCard surface="glass" title={T.statuses.title}>
                    <AiQueuedState
                        status="error"
                        jobStatus={null}
                        error={overview.error}
                        loadingText=""
                        errorFallback={T.state.fallback}
                        onRetry={overview.retry}
                    />
                </SectionCard>
            ) : (
                <>
                    <AiDmStatusesSection statuses={data?.statuses ?? null} />
                    <AiDmManagersSection
                        statuses={data?.statuses ?? null}
                        nameOf={nameOf}
                        selectedId={deals.filter.managerId}
                        onPick={openManagerDeals}
                    />
                </>
            )}
            <div ref={dealsRef} className="scroll-mt-4">
                <AiDmDealsSection
                    deals={deals}
                    statuses={data?.statuses ?? null}
                    nameOf={nameOf}
                />
            </div>
            {overview.status !== 'error' && (
                <>
                    <AiDmMatrixSection block={data?.matrix ?? null} nameOf={nameOf} />
                    <AiDmHonestySection block={data?.honesty ?? null} nameOf={nameOf} />
                </>
            )}
        </div>
    );
};
