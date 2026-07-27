'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectIsPublic } from '@/modules/app';
import { usePlansData } from './use-plans-data';

/**
 * Есть ли у сотрудника хоть один заданный план (для гейта секции
 * user-report: пустой заголовок «Планы» не показываем).
 */
export const useHasUserPlans = (userId: number): boolean => {
    const isPublic = useAppSelector(selectIsPublic);
    const plans = usePlansData();
    const targets = useAppSelector(
        state => state.plans.targetsByUser[userId],
    );

    return useMemo(() => {
        if (isPublic || !plans.canView || !plans.isConfigured) return false;
        if (!targets) return false;
        return plans.indicators.some(indicator => {
            const value = targets[indicator.code];
            return value !== null && value !== undefined && value > 0;
        });
    }, [isPublic, plans.canView, plans.isConfigured, plans.indicators, targets]);
};
