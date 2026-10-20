'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    financeEmployeeName,
    type FinanceClosedEmployee,
} from '@/modules/entities/finance';
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
 *
 * Финансовый факт одного сотрудника (страница сотрудника) — из его же
 * отчёта закрытых продаж (state.finance.userFinance), того самого, что
 * питает плитку «Сделок»: иначе на одной странице выходило «Сделок 2» при
 * «Продажи (шт) 0», когда командный отчёт не грузили или он устарел.
 * Для командного вида — командный отчёт (state.finance.closed).
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
    const closedEmployees = useAppSelector(
        state => state.finance.closed.report?.employees,
    );
    const singleUserId = userIds.length === 1 ? userIds[0] : undefined;
    const userFinanceEmployees = useAppSelector(state =>
        singleUserId !== undefined &&
        state.finance.userFinance.userId === singleUserId
            ? state.finance.userFinance.report?.employees
            : undefined,
    );
    const targetsByUser = useAppSelector(state => state.plans.targetsByUser);
    const departmentItems = useAppSelector(state => state.department.items);

    return useMemo(() => {
        const financeEmployees: FinanceClosedEmployee[] =
            userFinanceEmployees ?? closedEmployees ?? [];
        const sources: PlanFactSources = {
            report,
            callings: callings ?? [],
            airtime: airtime ?? null,
            financeEmployees,
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
        closedEmployees,
        userFinanceEmployees,
        targetsByUser,
        departmentItems,
        from,
        to,
    ]);
};
