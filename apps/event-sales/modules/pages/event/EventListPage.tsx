'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { EventListSkeleton } from '@/modules/widgets/EventList/ui/EventListSkeleton';

// Виджет списка доезжает лениво — страница держит лёгкий каркас (правило lazy).
const EventList = dynamic(
    () => import('@/modules/widgets/EventList/ui/EventList'),
    {
        ssr: false,
        loading: () => <EventListSkeleton />,
    },
);

/** Список событий (задач обзвона). */
const EventListPage: FC = () => {
    return (
        <div className="min-h-svh bg-background">
            <EventList />
        </div>
    );
};

export default EventListPage;
