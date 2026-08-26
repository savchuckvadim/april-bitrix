'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { EventListSkeleton } from '@/modules/widgets/EventList/ui/EventListSkeleton';

// Виджет вкладок доезжает лениво — страница держит лёгкий каркас (правило lazy).
const EventListTabs = dynamic(
    () =>
        import('@/modules/widgets/EventList/ui/EventListTabs').then(
            module => module.EventListTabs,
        ),
    {
        ssr: false,
        loading: () => <EventListSkeleton />,
    },
);

/**
 * Список событий (задач обзвона) маленького экрана — вкладками
 * дела / инфо / история / контакты (todo2508 №6).
 */
const EventListPage: FC = () => {
    return (
        <div className="h-full bg-background">
            <EventListTabs />
        </div>
    );
};

export default EventListPage;
