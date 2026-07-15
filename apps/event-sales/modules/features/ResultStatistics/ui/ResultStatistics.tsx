'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { RESULT_BADGES } from '../lib/result-badges';

/** Счётчики результатов звонков (данные — noCall.results). */
export const ResultStatistics: FC = () => {
    const results = useAppSelector(s => s.noCall.results);
    const isDone = useAppSelector(s => s.noCall.isDone);

    if (!isDone) return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {RESULT_BADGES.filter(badge => results[badge.key] > 0).map(badge => (
                <Badge key={badge.key} className={badge.className}>
                    {results[badge.key]} {badge.label}
                </Badge>
            ))}
        </div>
    );
};
