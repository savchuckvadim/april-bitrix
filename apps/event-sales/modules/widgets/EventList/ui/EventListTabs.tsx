'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { useCurrentRelations } from '@/modules/entities/RelatedCrm';
import { getPanelLeadId } from '@/modules/features/LeadRequestCard/lib/lead-request-view';
import { EventListSkeleton } from './EventListSkeleton';

// Тяжёлые карточки — лениво, как в EntityBoard (правило lazy).
const EventList = dynamic(() => import('./EventList'), {
    ssr: false,
    loading: () => <EventListSkeleton />,
});
const LeadRequestPanel = dynamic(
    () =>
        import('@/modules/features/LeadRequestCard/ui/LeadRequestPanel').then(
            module => module.LeadRequestPanel,
        ),
    { ssr: false },
);
const DuplicatesPanel = dynamic(
    () =>
        import(
            '@/modules/features/Duplicates/ui/DuplicatesPanel/DuplicatesPanel'
        ).then(module => module.DuplicatesPanel),
    { ssr: false },
);
const PurchaseSignalsCard = dynamic(
    () =>
        import(
            '@/modules/features/PurchaseSignals/ui/PurchaseSignalsCard'
        ).then(module => module.PurchaseSignalsCard),
    { ssr: false },
);
const EntityHistoryCard = dynamic(
    () =>
        import('@/modules/entities/EVHistory/ui/EntityHistoryCard').then(
            module => module.EntityHistoryCard,
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

/**
 * Маленький экран списка дел — вкладками (todo2508 №6): *дела (default),
 * *инфо, *история, *контакты. То, что на широком борде стоит левой колонкой,
 * здесь разложено по вкладкам — вертикаль экономится, а вся информация
 * остаётся в двух тапах.
 *
 * Nav минималистичный: узкий TabsList слева, на уровне «микрохедера» —
 * там же, где у широкой раскладки стоит градиент стадии основной сделки.
 */
export const EventListTabs: FC = () => {
    const { details } = useCurrentRelations();

    return (
        <Tabs defaultValue="tasks" className="flex h-full min-h-0 flex-col">
            <TabsList className="mx-2 mt-1 h-7 gap-0.5 self-start p-0.5">
                <TabsTrigger value="tasks" className="px-2 text-xs">
                    дела
                </TabsTrigger>
                <TabsTrigger value="info" className="px-2 text-xs">
                    инфо
                </TabsTrigger>
                <TabsTrigger value="history" className="px-2 text-xs">
                    история
                </TabsTrigger>
                <TabsTrigger value="contacts" className="px-2 text-xs">
                    контакты
                </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="min-h-0 flex-1">
                <EventList />
            </TabsContent>
            <TabsContent value="info" className="min-h-0 flex-1 space-y-2 p-2">
                <LeadRequestPanel leadId={getPanelLeadId(details?.leads)} />
                <DuplicatesPanel />
                <PurchaseSignalsCard />
            </TabsContent>
            <TabsContent
                value="history"
                className="min-h-0 flex-1 space-y-2 p-2"
            >
                <EntityHistoryCard />
            </TabsContent>
            <TabsContent
                value="contacts"
                className="min-h-0 flex-1 space-y-2 p-2"
            >
                <ContactsHubCard />
            </TabsContent>
        </Tabs>
    );
};
