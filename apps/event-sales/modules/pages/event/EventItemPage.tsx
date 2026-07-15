'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { EventItemSkeleton } from '@/modules/widgets/EventItem/ui/EventItemSkeleton';

// Виджет формы отчёта доезжает лениво (правило lazy).
const EventItem = dynamic(
    () => import('@/modules/widgets/EventItem/ui/EventItem'),
    {
        ssr: false,
        loading: () => <EventItemSkeleton />,
    },
);

/** Страница отчёта по событию. */
const EventItemPage: FC = () => {
    return (
        <div className="min-h-svh bg-background">
            <EventItem />
        </div>
    );
};

export default EventItemPage;
