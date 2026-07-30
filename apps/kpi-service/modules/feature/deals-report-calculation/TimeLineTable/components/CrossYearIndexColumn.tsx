import React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { YearToYearIndex } from '../lib/utils/timeline.utils';

interface CrossYearIndexColumnProps {
    crossYearIndexes: YearToYearIndex[];
    /** Количество лет диапазона — от него зависит высота полос таймлайна. */
    yearsCount: number;
}

/**
 * Колонка «Итоговая индексация»: полоса на каждую пару соседних лет.
 * Высота полосы = 2 × высота годовой полосы таймлайна (пара соответствует
 * двум годам). Вынесена из TimelineTable (разметка дублировалась).
 */
export const CrossYearIndexColumn: React.FC<CrossYearIndexColumnProps> =
    React.memo(({ crossYearIndexes, yearsCount }) => {
        const coefficient = yearsCount > 1 ? 30 : 16;
        const singleYearHeight = Math.max(8, Math.floor(coefficient / yearsCount));
        const dynamicHeight = singleYearHeight * 2;

        return (
            <div className="flex flex-col gap-0.5">
                {crossYearIndexes.map(yearIndex => (
                    <div
                        key={`${yearIndex.fromYear}-${yearIndex.toYear}`}
                        className={cn(
                            'rounded text-xs flex items-center justify-center font-medium text-white',
                            yearIndex.indexGrowth > 0
                                ? 'bg-green-600'
                                : yearIndex.indexGrowth < 0
                                  ? 'bg-red-600'
                                  : 'bg-gray-400',
                        )}
                        style={{ height: `${dynamicHeight}px` }}
                    >
                        {yearIndex.indexGrowth !== 0
                            ? `${yearIndex.indexGrowth >= 0 ? '+' : ''}${yearIndex.indexGrowth.toFixed(1)}%`
                            : '-'}
                    </div>
                ))}
            </div>
        );
    });

CrossYearIndexColumn.displayName = 'CrossYearIndexColumn';
