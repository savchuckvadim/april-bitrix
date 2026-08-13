'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@workspace/ui/lib/utils';
import { SectionSkeleton } from '@/modules/shared/SectionState';

import { NoCallMenu } from '@/modules/features/NoCall';
import { ReturnToTMCMenu } from '@/modules/features/ReturnToTMC';
import { FlowStatusBanner } from '@/modules/widgets/EventList/ui/FlowStatusBanner';
import { getPanelLeadId } from '@/modules/features/LeadRequestCard/lib/lead-request-view';
import { useUiDensity } from '@/modules/app/lib/hooks/use-ui-density';
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
const LeadRequestPanel = dynamic(
    () => import('@/modules/features/LeadRequestCard/ui/LeadRequestPanel'),
    { ssr: false, loading: () => <SectionSkeleton title="Заявка" /> },
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
    // Во встройке-вкладке высоту задаём мы подгонкой под контент — значит экран
    // течёт, а не запирается в h-svh со своими скроллами (см. use-ui-density).
    const { isSelfSized } = useUiDensity();

    if (!descriptor) {
        return (
            <div className="flex min-h-svh items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">
                    Не удалось определить клиента: встройка открыта без
                    компании, лида и сделки.
                </p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col gap-3 bg-background p-3',
                isSelfSized ? 'min-h-0' : 'h-svh overflow-hidden',
            )}
        >
            <NoCallMenu />
            <ReturnToTMCMenu />

            <EntityBoardHeader
                descriptor={descriptor}
                responsible={details?.responsible}
            />
            <FlowStatusBanner />

            <div
                className={cn(
                    'grid gap-3 lg:grid-cols-2',
                    !isSelfSized && 'min-h-0 flex-1',
                )}
            >
                {/* Дела первыми в DOM: на узком экране это верх страницы. */}
                <div
                    className={cn(
                        'order-1 flex flex-col gap-3 lg:order-2',
                        !isSelfSized && 'min-h-0',
                    )}
                >
                    <EntityTasksCard details={details ?? null} />
                </div>

                <div
                    className={cn(
                        'order-2 flex flex-col gap-3 lg:order-1',
                        !isSelfSized && 'min-h-0 overflow-y-auto',
                    )}
                >
                    {/* Секции показываются ВСЕГДА, вместе со своим состоянием.
                        Раньше они рендерились только при непустом списке: пока
                        связи грузились или запрос падал, экран молчал — и это
                        читалось как «связей нет», хотя их просто не принесли. */}
                    {/* {связанные сделки точно закомменчу потом будем их доделывать сейчас работают криво
                        показывается в сделке карточка пустая. Лиды это что типа если заявка не лид ?
                        } */}
                    {/* <RelatedDealsCard
                        deals={details?.deals ?? []}
                        currentDealId={descriptor.currentDealId}
                        includeClosed={includeClosed}
                        onIncludeClosedChange={setIncludeClosed}
                        status={status}
                        onRetry={reload}
                    />
             */}

                 {/* {details?.leads && details.leads.length > 0 && (
                     <RelatedLeadsCard
                        leads={details.leads}
                        status={status}
                        onRetry={reload}
                    />)} */}
                    {/* Карточка заявки: первый открытый связанный лид либо
                        лид контекста встройки (панель сама скрывается). */}
                    <LeadRequestPanel leadId={getPanelLeadId(details?.leads)} />
                    <EntityHistoryCard />
                    <DuplicatesPanel />
                </div>
            </div>
        </div>
    );
};

export default EntityBoard;
