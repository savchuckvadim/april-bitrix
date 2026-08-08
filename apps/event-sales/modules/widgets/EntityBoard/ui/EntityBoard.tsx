'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { SectionSkeleton } from '@/modules/shared/SectionState';

import { NoCallMenu } from '@/modules/features/NoCall';
import { ReturnToTMCMenu } from '@/modules/features/ReturnToTMC';
import { FlowStatusBanner } from '@/modules/widgets/EventList/ui/FlowStatusBanner';
import { useEntityBoard } from '../lib/hooks/use-entity-board';
import { EntityBoardHeader } from './EntityBoardHeader';
import { EntityTasksCard } from './EntityTasksCard';

// Секции связей и истории доезжают лениво, каждая со своим скелетоном: их код
// не нужен для первого кадра, а данные всё равно приходят позже. Дела грузим
// сразу — ради них сюда и заходят.
const RelatedDealsCard = dynamic(
    () => import('@/modules/entities/RelatedCrm/ui/RelatedDealsCard'),
    { ssr: false, loading: () => <SectionSkeleton title="Сделки" /> },
);
const RelatedLeadsCard = dynamic(
    () => import('@/modules/entities/RelatedCrm/ui/RelatedLeadsCard'),
    { ssr: false, loading: () => <SectionSkeleton title="Лиды" /> },
);
const EntityHistoryCard = dynamic(
    () => import('@/modules/entities/EVHistory/ui/EntityHistoryCard'),
    { ssr: false, loading: () => <SectionSkeleton title="История" rows={2} /> },
);
const DuplicatesPanel = dynamic(
    () =>
        import(
            '@/modules/features/Duplicates/ui/DuplicatesPanel/DuplicatesPanel'
        ).then(module => module.DuplicatesPanel),
    { ssr: false },
);

/**
 * Полноэкранная карточка клиента для встройки таймлайна.
 *
 * Скроллятся секции, а не страница: при сотне дел шапка и сделки обязаны
 * остаться на месте, иначе менеджер теряет контекст, ради которого экран и
 * делался. На узком экране раскладка схлопывается в одну колонку, и первыми
 * идут дела — то, ради чего сюда заходят чаще всего.
 */
export const EntityBoard: FC = () => {
    const {
        descriptor,
        details,
        status,
        includeClosed,
        setIncludeClosed,
        reload,
    } = useEntityBoard();


    if (!descriptor) {
        return (
            <div className="flex min-h-svh items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">
                    Не удалось определить клиента: встройка открыта без компании,
                    лида и сделки.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-svh flex-col gap-3 overflow-hidden bg-background p-3">
            <NoCallMenu />
            <ReturnToTMCMenu />

            <EntityBoardHeader
                descriptor={descriptor}
                responsible={details?.responsible}
            />
            <FlowStatusBanner />

            <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
                {/* Дела первыми в DOM: на узком экране это верх страницы. */}
                <div className="order-1 flex min-h-0 flex-col gap-3 lg:order-2">
                    <EntityTasksCard details={details ?? null} />
                </div>

                <div className="order-2 flex min-h-0 flex-col gap-3 overflow-y-auto lg:order-1">
                    {details?.deals && details?.deals.length
                        ? <RelatedDealsCard
                            deals={details?.deals ?? []}
                            currentDealId={descriptor.currentDealId}
                            includeClosed={includeClosed}
                            onIncludeClosedChange={setIncludeClosed}
                            status={status}
                            onRetry={reload}
                        /> : ''}
                    {details?.leads && details?.leads.length
                        ? <RelatedLeadsCard
                            leads={details?.leads ?? []}
                            status={status}
                            onRetry={reload}
                        /> : ''}
                    <EntityHistoryCard />
                    <DuplicatesPanel />
                </div>
            </div>
        </div>
    );
};

export default EntityBoard;
