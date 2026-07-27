'use client';

import React from 'react';
import { Trophy, TrendingDown } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { formatPercent } from '@/modules/feature/report-conversions';
import { AwardBadge } from './AwardBadge';

interface UserAwardBadgesProps {
    userId: number;
    className?: string;
}

/**
 * Награды пользователя рядом с именем: чемпион-шаг (успех) и зона роста
 * (destructive). Данные — reportAwards (листенер пересчитывает из общей
 * командной конверсии). Наград нет — ничего не рендерим.
 */
export const UserAwardBadges: React.FC<UserAwardBadgesProps> = ({
    userId,
    className,
}) => {
    const award = useAppSelector(
        state => state.reportAwards.byUserId[userId],
    );
    if (!award || (!award.champion && !award.zone)) return null;

    return (
        <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
            {award.champion && (
                <AwardBadge
                    tone="success"
                    icon={<Trophy className="h-3 w-3 shrink-0" />}
                    suffix={`1 из ${award.champion.total}`}
                >
                    Чемпион: {award.champion.stepLabel} ·{' '}
                    {formatPercent(award.champion.percent)}
                </AwardBadge>
            )}
            {award.zone && (
                <AwardBadge
                    tone="destructive"
                    icon={<TrendingDown className="h-3 w-3 shrink-0" />}
                >
                    Зона роста: {award.zone.stepLabel}
                    {award.zone.percent !== null
                        ? ` · ${formatPercent(award.zone.percent)}`
                        : ''}
                </AwardBadge>
            )}
        </div>
    );
};
