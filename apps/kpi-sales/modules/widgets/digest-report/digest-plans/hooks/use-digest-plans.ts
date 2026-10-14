'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    aggregateCells,
    rowsWithAnyPlan,
    usePlansData,
} from '@/modules/feature/plans';
import { useDigestData } from '../../lib/digest-data.context';
import {
    buildDigestPlanRows,
    expectedShareOfDay,
} from '../../lib/digest-plan-fact.util';

/**
 * План дня: включённые показатели «Планов», цели сотрудников, факты из
 * дайджеста. Рядовой без PLANS_VIEW_ALL видит только свою строку.
 */
export const useDigestPlans = () => {
    const { indicators, isConfigured, canView, canViewAll, currentUserId } =
        usePlansData();
    const targetsByUser = useAppSelector(state => state.plans.targetsByUser);
    const { visibleRows, date } = useDigestData();

    return useMemo(() => {
        const employees = visibleRows
            .filter(row => canViewAll || row.userId === currentUserId)
            .map(row => row.employee);
        const rows = rowsWithAnyPlan(
            buildDigestPlanRows(employees, indicators, targetsByUser, date),
        );
        return {
            visible: canView && isConfigured && rows.length > 0,
            indicators,
            rows,
            totals: rows.length > 1 ? aggregateCells(indicators, rows) : undefined,
            expected: expectedShareOfDay(date),
        };
    }, [
        visibleRows,
        canViewAll,
        currentUserId,
        indicators,
        targetsByUser,
        date,
        canView,
        isConfigured,
    ]);
};
