'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { RefreshCw } from 'lucide-react';
import { ReportBlockWrapper } from '@/modules/entities/report';
import { Preloader } from '@/modules/shared';
import { useHotClients } from '../hooks/use-hot-clients';
import { FinanceTypeFilters } from './components/FinanceTypeFilters';
import { HotClientsFilters } from './components/HotClientsFilters';
import { HotClientsSummary } from './components/HotClientsSummary';
import { HotClientsTable } from './components/HotClientsTable';

interface HotClientsWidgetProps {
    /** user-scoped вариант: только открытые сделки этого менеджера. */
    userId?: number;
}

/**
 * Горячие клиенты (открытые сделки) с клиентскими фильтрами и сводкой,
 * пересчитываемой из отфильтрованных сделок. Переиспользуется командным
 * финанс-отчётом (все сделки) и user-report (userId → только менеджер).
 * Вся логика — в useHotClients; здесь только композиция.
 */
export const HotClientsWidget: React.FC<HotClientsWidgetProps> = ({
    userId,
}) => {
    const hot = useHotClients(userId);

    return (
        <ReportBlockWrapper
            blockId={
                userId
                    ? `finance-hot-clients-user-${userId}`
                    : 'finance-hot-clients'
            }
            title="Горячие клиенты"
            onDownload={hot.download}
        >
            {/* Пересчитать, игнорируя кэш: промежуточный кэш строк дотянет
                только изменённые сделки — быстрее полного пересбора. */}
            <div className="mb-2 flex flex-wrap items-center justify-end gap-3">
                {/* Глобальные фильтры типов — только командный вариант. */}
                {!userId && <FinanceTypeFilters />}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={hot.refresh}
                    disabled={hot.status === 'loading'}
                >
                    <RefreshCw className="h-3 w-3" />
                    Пересчитать
                </Button>
            </div>
            <HotClientsFilters
                threshold={hot.threshold}
                onThresholdChange={hot.setThreshold}
                stages={hot.stages}
                stage={hot.stage}
                onStageAll={hot.resetStage}
                onStageToggle={hot.toggleStage}
                perspectiveColors={hot.perspectiveColors}
                perspective={hot.perspective}
                onPerspectiveAll={hot.resetPerspective}
                onPerspectiveSelect={hot.setPerspective}
                offer={hot.offer}
                onOfferChange={hot.setOffer}
                filterActive={hot.filterActive}
                visibleCount={hot.visibleDeals.length}
                baseCount={hot.baseCount}
            />

            {(hot.status === 'loading' || hot.status === 'idle') && (
                <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
                    <Preloader />
                    <span>Собираем открытые сделки…</span>
                </div>
            )}

            {hot.status === 'ready' && hot.hasReport && (
                <>
                    <HotClientsSummary totals={hot.totals} />
                    <HotClientsTable
                        deals={hot.visibleDeals}
                        hideManager={Boolean(userId)}
                    />
                </>
            )}
        </ReportBlockWrapper>
    );
};
