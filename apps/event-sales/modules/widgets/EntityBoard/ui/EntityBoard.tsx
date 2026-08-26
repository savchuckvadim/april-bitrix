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
import { EntityTasksCard } from './EntityTasksCard';

// Секции связей и истории доезжают лениво, каждая со своим скелетоном: их код
// не нужен для первого кадра, а данные всё равно приходят позже. Дела грузим
// сразу — ради них сюда и заходят.
// Секции «Сделки» и «Лиды» пока скрыты (решение владельца 20.08: без них
// на экране и так много всего) — вернуть вместе с JSX ниже.
// const RelatedDealsCard = dynamic(
//     () => import('@/modules/entities/RelatedCrm/ui/RelatedDealsCard'),
//     { ssr: false, loading: () => <SectionSkeleton title="Сделки" /> },
// );
// const RelatedLeadsCard = dynamic(
//     () => import('@/modules/entities/RelatedCrm/ui/RelatedLeadsCard'),
//     { ssr: false, loading: () => <SectionSkeleton title="Лиды" /> },
// );
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
// Звонки по решению — стилистика RelatedDealsCard/RelatedLeadsCard; карточка
// сама молчит у клиентов без ссылок op_zprs, поэтому без loading-скелетона.
const ZprCallsCard = dynamic(
    () =>
        import('@/modules/entities/ZprCalls/ui/ZprCallsCard').then(
            module => module.ZprCallsCard,
        ),
    { ssr: false },
);

const ContactsHubCard = dynamic(
    () =>
        import('@/modules/features/ContactsHub/ui/ContactsHubCard').then(
            module => module.ContactsHubCard,
        ),
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
    // status/includeClosed/setIncludeClosed/reload вернутся вместе с
    // секциями «Сделки»/«Лиды» (скрыты ниже).
    const { descriptor, details } = useEntityBoard();
    // Во встройке-вкладке высоту задаём мы подгонкой под контент — значит экран
    // течёт, а не запирается в h-svh со своими скроллами (см. use-ui-density).
    const { isSelfSized } = useUiDensity();

    if (!descriptor) {
        return (
            <div className="flex h-full min-h-40 items-center justify-center p-4">
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
                // Высоту в запертом режиме даёт каркас App (flex h-svh со
                // общей шапкой сверху) — берём её всю, а не h-svh: иначе
                // доска вылезала бы за экран ровно на высоту шапки.
                isSelfSized ? 'min-h-0' : 'h-full overflow-hidden',
            )}
        >
            <NoCallMenu />
            <ReturnToTMCMenu />

            {/* Все действия экрана (создать, статистика, режим, темы) — в
                правом верхнем углу общей шапки; своей строки действий нет. */}
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
                    {/* Секции «Сделки» и «Лиды» пока скрыты (решение
                        владельца 20.08): градиенты и так в общей шапке, а
                        без них на экране меньше шума. Вернуть вместе с
                        dynamic-импортами выше:
                    <RelatedDealsCard
                        deals={details?.deals ?? []}
                        currentDealId={descriptor.currentDealId}
                        includeClosed={includeClosed}
                        onIncludeClosedChange={setIncludeClosed}
                        status={status}
                        onRetry={reload}
                    />
                    <RelatedLeadsCard
                        leads={details?.leads ?? []}
                        status={status}
                        onRetry={reload}
                    /> */}
                    {/* Звонки по решению — на месте скрытых секций связей;
                        у клиентов без ЗПР карточка молчит сама. */}
                    <ZprCallsCard />
                    {/* Карточка заявки: первый открытый связанный лид либо
                        лид контекста встройки (панель сама скрывается). */}
                    <LeadRequestPanel leadId={getPanelLeadId(details?.leads)} />
                    <EntityHistoryCard />
                    <DuplicatesPanel />
                    <ContactsHubCard />
                </div>
            </div>
        </div>
    );
};

export default EntityBoard;
