'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { financeEmployeeName } from '@/modules/entities/finance';
import {
    buildUserAchievementCells,
    EnabledPlanIndicator,
    PlanAchievementRow,
    planExpectedShare,
} from '../lib/plan-achievement.util';
import type { PlanFactSources } from '../lib/plan-fact.util';

export interface UsePlanAchievementResult {
    rows: PlanAchievementRow[];
    /** Ожидаемая доля выполнения к «сейчас» (риска прогресс-баров). */
    expected: number;
    from: string;
    to: string;
}

/**
 * Достижение планов для набора сотрудников: факты из уже загруженных
 * слайсов (report/callings/airtime/finance), план пересчитан на выбранный
 * период отчёта. Пользователи без имён в отчёте берутся из структуры.
 */
export const usePlanAchievement = (
    indicators: EnabledPlanIndicator[],
    userIds: number[],
): UsePlanAchievementResult => {
    const from = useAppSelector(state => state.report.date.from);
    const to = useAppSelector(state => state.report.date.to);
    const report = useAppSelector(state => state.report.report);
    const callings = useAppSelector(state => state.callingStatistics.items);
    const airtime = useAppSelector(state => state.airtime.team.data);
    const financeEmployees = useAppSelector(
        state => state.finance.closed.report?.employees,
    );
    const targetsByUser = useAppSelector(state => state.plans.targetsByUser);
    const departmentItems = useAppSelector(state => state.department.items);

    return useMemo(() => {
        const sources: PlanFactSources = {
            report,
            callings: callings ?? [],
            airtime: airtime ?? null,
            financeEmployees: financeEmployees ?? [],
        };
        const nameOf = (userId: number): string => {
            const fromReport = report.find(
                item => Number(item.user.ID) === userId,
            );
            return (
                fromReport?.userName ||
                financeEmployeeName(departmentItems, userId)
            );
        };

        const rows: PlanAchievementRow[] = userIds.map(userId => ({
            userId,
            userName: nameOf(userId),
            cells: buildUserAchievementCells(
                indicators,
                targetsByUser[userId],
                sources,
                userId,
                from,
                to,
            ),
        }));

        return { rows, expected: planExpectedShare(from, to), from, to };
    }, [
        indicators,
        userIds,
        report,
        callings,
        airtime,
        financeEmployees,
        targetsByUser,
        departmentItems,
        from,
        to,
    ]);
};
