'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    COMPARISON_MODE_LABELS,
    financeActions,
    type ComparisonMode,
} from '@/modules/entities/finance';

const MODES: ComparisonMode[] = ['off', 'prev', 'yoy'];

/** Переключатель периода сравнения (выкл / прошлый период / год к году). */
export const ComparisonToggle: React.FC = () => {
    const dispatch = useAppDispatch();
    const mode = useAppSelector(state => state.finance.comparison.mode);

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Сравнение:</span>
            {MODES.map(item => (
                <Button
                    key={item}
                    variant={mode === item ? 'default' : 'outline'}
                    className="h-6 px-2 text-xs"
                    onClick={() =>
                        dispatch(financeActions.setComparisonMode(item))
                    }
                >
                    {COMPARISON_MODE_LABELS[item]}
                </Button>
            ))}
        </div>
    );
};
