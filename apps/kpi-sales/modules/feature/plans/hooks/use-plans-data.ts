'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { loadPlansData } from '../model/plans-thunks';
import {
    EnabledPlanIndicator,
    enabledIndicators,
} from '../lib/plan-achievement.util';

export interface UsePlansDataResult {
    status: string;
    /** Включённые показатели с портальными именами/периодами. */
    indicators: EnabledPlanIndicator[];
    /** Планы настроены (есть хоть один включённый показатель). */
    isConfigured: boolean;
    canView: boolean;
    canViewAll: boolean;
    canConfigure: boolean;
    /** Bitrix id текущего (эффективного) пользователя. */
    currentUserId: number;
}

/**
 * Данные планов + доступы: лениво грузит каталог/конфиг/цели (idle-guard),
 * отдаёт включённые показатели. Рядовой (без PLANS_VIEW_ALL) видит только
 * свои строки — фильтрация на потребителях по currentUserId.
 */
export const usePlansData = (): UsePlansDataResult => {
    const dispatch = useAppDispatch();
    const canView = useAccess(EAccessFeature.PLANS_VIEW);
    const canViewAll = useAccess(EAccessFeature.PLANS_VIEW_ALL);
    const canConfigure = useAccess(EAccessFeature.PLANS_CONFIGURE);
    const status = useAppSelector(state => state.plans.status);
    const catalog = useAppSelector(state => state.plans.catalog);
    const configs = useAppSelector(state => state.plans.indicators);
    const currentUser = useAppSelector(
        state => state.department.currentUser,
    );

    useEffect(() => {
        if (canView && status === 'idle') {
            dispatch(loadPlansData());
        }
    }, [dispatch, canView, status]);

    const indicators = useMemo(
        () => enabledIndicators(catalog, configs),
        [catalog, configs],
    );

    return {
        status,
        indicators,
        isConfigured: indicators.length > 0,
        canView,
        canViewAll,
        canConfigure,
        currentUserId: Number(currentUser?.userId ?? 0),
    };
};
