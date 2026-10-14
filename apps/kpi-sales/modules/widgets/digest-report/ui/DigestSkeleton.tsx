'use client';

import { Preloader } from '@/modules/shared';

interface DigestSkeletonProps {
    queued: boolean;
}

/** Каркас на время сборки: плитки, график, таблица. */
export const DigestSkeleton = ({ queued }: DigestSkeletonProps) => (
    <div className="space-y-4" aria-busy="true">
        <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
            <Preloader />
            <span>
                {queued
                    ? 'Собираем день: события, план и звонки по всему порталу…'
                    : 'Загружаем дайджест…'}
            </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-md bg-muted" />
            ))}
        </div>
        <div className="h-64 animate-pulse rounded-md bg-muted" />
        <div className="h-48 animate-pulse rounded-md bg-muted" />
    </div>
);
