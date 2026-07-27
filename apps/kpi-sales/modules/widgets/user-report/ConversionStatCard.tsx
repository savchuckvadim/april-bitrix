'use client';

import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Trophy, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
    conversionTextClass,
    formatPercent,
    UserConversionStepInsight,
} from '@/modules/feature/report-conversions';

interface ConversionStatCardProps {
    insight: UserConversionStepInsight;
}

/**
 * Компактная карточка шага конверсии менеджера: % и «N из M» в одну
 * строку, медиана команды с дельтой — мелкой подстрокой.
 */
export const ConversionStatCard: React.FC<ConversionStatCardProps> = ({
    insight,
}) => {
    const { def, user, teamMedian, deltaPct, isChampion, intent } = insight;

    return (
        <Card className="bg-popover">
            <CardContent className="p-3">
                <p className="truncate text-[11px] text-muted-foreground">
                    {def.fromName} → {def.toName}
                </p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                        className={cn(
                            'text-lg font-bold leading-tight',
                            conversionTextClass(intent),
                        )}
                    >
                        {formatPercent(user.percent)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                        {user.numerator} из {user.denominator}
                    </span>
                    {isChampion && (
                        <span
                            className="inline-flex items-center rounded-full bg-warning/15 p-0.5 text-warning"
                            title="Чемпион команды по этому шагу"
                        >
                            <Trophy className="h-3 w-3" />
                        </span>
                    )}
                </div>
                {teamMedian !== null && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        медиана {formatPercent(teamMedian)}
                        {deltaPct !== null && deltaPct !== 0 && (
                            <span
                                className={cn(
                                    'inline-flex items-center gap-0.5 font-medium',
                                    deltaPct > 0
                                        ? 'text-success'
                                        : 'text-destructive',
                                )}
                            >
                                {deltaPct > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {deltaPct > 0 ? '+' : ''}
                                {(Math.round(deltaPct * 10) / 10).toLocaleString(
                                    'ru-RU',
                                )}
                            </span>
                        )}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
