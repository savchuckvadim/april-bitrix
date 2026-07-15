'use client';

import { FC } from 'react';

/** Skeleton формы отчёта (fallback lazy-загрузки виджета). */
export const EventItemSkeleton: FC = () => (
    <div className="grid gap-4 p-2 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
    </div>
);

export default EventItemSkeleton;
