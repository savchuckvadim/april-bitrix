import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface FinanceDeltaBadgeProps {
    /** Отклонение к базе в процентах; null — базы нет («— нет базы»). */
    delta: number | null;
}

/** Дельта к периоду сравнения: цвет и стрелка по знаку. */
export const FinanceDeltaBadge: React.FC<FinanceDeltaBadgeProps> = ({
    delta,
}) => {
    if (delta === null) {
        return <span className="text-xs text-muted-foreground">— нет базы</span>;
    }
    const positive = delta >= 0;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                positive ? 'text-success' : 'text-destructive',
            )}
        >
            {positive ? (
                <TrendingUp className="h-3 w-3" />
            ) : (
                <TrendingDown className="h-3 w-3" />
            )}
            {positive ? '+' : ''}
            {(Math.round(delta * 10) / 10).toLocaleString('ru-RU')}%
        </span>
    );
};
