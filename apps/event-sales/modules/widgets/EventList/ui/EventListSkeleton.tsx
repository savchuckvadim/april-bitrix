'use client';

import { FC } from 'react';

/** Skeleton списка событий (и fallback lazy-загрузки виджета). */
export const EventListSkeleton: FC = () => (
    <div className="space-y-2 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
        ))}
    </div>
);

export default EventListSkeleton;
