'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { EventListSkeleton } from '@/modules/widgets/EventList/ui/EventListSkeleton';

// Экран доезжает лениво — страница держит лёгкий каркас (правило lazy).
const EntityBoard = dynamic(
    () => import('@/modules/widgets/EntityBoard/ui/EntityBoard'),
    {
        ssr: false,
        loading: () => (
            <div className="p-3">
                <EventListSkeleton />
            </div>
        ),
    },
);

/** Полноэкранная карточка клиента (встройка таймлайна). */
const EntityBoardPage: FC = () => <EntityBoard />;

export default EntityBoardPage;
