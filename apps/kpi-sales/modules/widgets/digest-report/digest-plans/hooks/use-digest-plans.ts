'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { usePlansData } from '@/modules/feature/plans';
import { useDigestData } from '../../lib/digest-data.context';
import {
    buildDigestPlanRows,
    expectedShareOfDay,
} from '../../lib/digest-plan-fact.util';

/**
 * План дня: включённые показатели «Планов», цели сотрудников, план CRM и
 * факты из дайджеста по всем сотрудникам выборки (как таблица — фокус не
 * сужает). Рядовой без PLANS_VIEW_ALL видит только свою строку.
 */
export const useDigestPlans = () => {
    const { indicators, isConfigured, canView, canViewAll, currentUserId } =
        usePlansData();
    const targetsByUser = useAppSelector(state => state.plans.targetsByUser);
    const { rows: allRows, date } = useDigestData();

    return useMemo(() => {
        const employees = allRows
            .filter(row => canViewAll || row.userId === currentUserId)
            .map(row => row.employee);
        const rows = buildDigestPlanRows(employees, indicators, targetsByUser, date);
        return {
            visible: canView && isConfigured && rows.length > 0,
            indicators,
            rows,
            presentUserIds: rows.map(row => row.userId),
            expected: expectedShareOfDay(date),
        };
    }, [allRows, canViewAll, currentUserId, indicators, targetsByUser, date, canView, isConfigured]);
};
