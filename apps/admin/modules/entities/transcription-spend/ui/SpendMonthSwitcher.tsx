'use client';

import { Button } from '@workspace/ui/components/button';
import { currentMoscowMonth, monthLabel, shiftMonth } from '../lib/spend-format';

interface SpendMonthSwitcherProps {
    month: string;
    onChange: (month: string) => void;
    loading?: boolean;
}

/** Переключатель месяца: назад, «ноябрь 2026», вперёд (не дальше текущего). */
export const SpendMonthSwitcher = ({ month, onChange, loading }: SpendMonthSwitcherProps) => {
    const isCurrent = month >= currentMoscowMonth();
    return (
        <div className="flex items-center gap-2 text-sm">
            <Button variant="outline" size="sm" onClick={() => onChange(shiftMonth(month, -1))}>
                ←
            </Button>
            <span className="min-w-32 text-center font-medium">
                {monthLabel(month)}
                {loading ? ' · загружаем…' : ''}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={isCurrent}
                onClick={() => onChange(shiftMonth(month, 1))}
            >
                →
            </Button>
        </div>
    );
};
