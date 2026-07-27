'use client';

import React, { useMemo } from 'react';
import { CardContent } from '@workspace/ui/components/card';
import { GlassCard } from '@workspace/april-ui';
import { Target } from 'lucide-react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectIsPublic } from '@/modules/app';
import { usePlansData } from '../hooks/use-plans-data';
import { usePlanAchievement } from '../hooks/use-plan-achievement';
import { PlanProgressCell } from './PlanProgressCell';

interface UserPlansProgressProps {
    userId: number;
}

/**
 * Плитки достижения планов на странице сотрудника (user-report):
 * по включённому показателю — «факт / план · %» + жидкий прогресс с
 * риской ожидаемого темпа. Планы не настроены/фича выключена — ничего.
 */
export const UserPlansProgress: React.FC<UserPlansProgressProps> = ({
    userId,
}) => {
    const isPublic = useAppSelector(selectIsPublic);
    const plans = usePlansData();
    const userIds = useMemo(() => [userId], [userId]);
    const achievement = usePlanAchievement(plans.indicators, userIds);

    if (isPublic || !plans.canView || !plans.isConfigured) return null;
    const row = achievement.rows[0];
    if (!row) return null;
    const hasAnyPlan = row.cells.some(cell => cell.plan !== null);
    if (!hasAnyPlan) return null;

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plans.indicators.map((indicator, index) => {
                const cell = row.cells[index];
                if (!cell || cell.plan === null) return null;
                return (
                    <GlassCard
                        key={indicator.code}
                        intensity="strong"
                        className="bg-popover"
                    >
                        <CardContent className="p-3">
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Target className="h-3.5 w-3.5" />
                                {indicator.displayName}
                            </p>
                            <div className="mt-2">
                                <PlanProgressCell
                                    cell={cell}
                                    unit={indicator.unit}
                                    expected={achievement.expected}
                                />
                            </div>
                        </CardContent>
                    </GlassCard>
                );
            })}
        </div>
    );
};
