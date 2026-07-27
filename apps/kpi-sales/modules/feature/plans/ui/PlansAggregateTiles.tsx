'use client';

import React from 'react';
import { CardContent } from '@workspace/ui/components/card';
import { GlassCard } from '@workspace/april-ui';
import { Target } from 'lucide-react';
import type {
    EnabledPlanIndicator,
    PlanAchievementCell,
} from '../lib/plan-achievement.util';
import { PlanProgressCell } from './PlanProgressCell';

interface PlansAggregateTilesProps {
    indicators: EnabledPlanIndicator[];
    /** Агрегированные ячейки (Σ планов и фактов — aggregateCells). */
    cells: PlanAchievementCell[];
    expected: number;
    /** Подпись агрегата («Итого по команде» / «Итого по секции»). */
    title?: string;
}

/**
 * Плитки-итого достижения планов по группе/отделу/команде — та же
 * визуализация, что у отдельного сотрудника (жидкий прогресс с риской
 * ожидаемого темпа): сразу видно, достигает ли секция план.
 * Показатели без единого заданного плана пропускаются.
 */
export const PlansAggregateTiles: React.FC<PlansAggregateTilesProps> = ({
    indicators,
    cells,
    expected,
    title = 'Итого',
}) => {
    const withPlan = indicators.flatMap((indicator, index) => {
        const cell = cells[index];
        return cell && cell.plan !== null ? [{ indicator, cell }] : [];
    });
    if (!withPlan.length) return null;

    return (
        <div className="mb-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
                {title}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {withPlan.map(({ indicator, cell }) => (
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
                                    expected={expected}
                                />
                            </div>
                        </CardContent>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
