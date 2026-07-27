'use client';

import React from 'react';
import { LiquidProgress } from '@workspace/april-ui';
import type { PlanAchievementCell } from '../lib/plan-achievement.util';
import type { PlanUnit } from '../model';
import {
    formatPlanPercent,
    formatPlanValue,
    planTone,
} from '../lib/plans.data';

interface PlanProgressCellProps {
    cell: PlanAchievementCell;
    unit: PlanUnit;
    /** Ожидаемая доля к «сейчас» (риска на полосе). */
    expected: number;
}

/**
 * Ячейка достижения плана: «факт / план · %» + жидкий прогресс с риской
 * ожидаемого темпа. План не задан — только факт, без полосы.
 */
export const PlanProgressCell: React.FC<PlanProgressCellProps> = ({
    cell,
    unit,
    expected,
}) => {
    if (cell.plan === null) {
        return (
            <div className="text-xs text-muted-foreground">
                {formatPlanValue(cell.fact, unit)}
                <span className="ml-1 opacity-60">/ план не задан</span>
            </div>
        );
    }

    return (
        <div className="min-w-[140px] space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium">
                    {formatPlanValue(cell.fact, unit)}
                    <span className="text-muted-foreground">
                        {' '}
                        / {formatPlanValue(cell.plan, unit)}
                    </span>
                </span>
                <span className="font-semibold">
                    {formatPlanPercent(cell.percent)}
                </span>
            </div>
            <LiquidProgress
                value={cell.percent ?? 0}
                expected={expected}
                tone={planTone(cell.percent, expected)}
                size="sm"
            />
        </div>
    );
};
