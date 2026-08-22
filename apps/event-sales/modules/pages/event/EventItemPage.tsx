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

/**
 * Страница отчёта по событию.
 *
 * Высоту задаёт каркас приложения (App): страница занимает то, что осталось
 * под общей шапкой. Своей `min-h-svh` здесь быть не должно — вместе с шапкой
 * это давало лишний экран прокрутки ровно на её высоту.
 */
const EventItemPage: FC = () => {
    return (
        <div className="h-full bg-background">
            <EventItem />
        </div>
    );
};

export default EventItemPage;
