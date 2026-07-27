'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectIsPublic } from '@/modules/app';
import { ReportBlockWrapper, useReport } from '@/modules/entities/report';
import { ReportGroupTabs, StructureSection } from '@/modules/feature/report-tabs';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import {
    aggregateCells,
    buildPlanRatingDataset,
    PLANS_BLOCK_ID,
    PlansAchievementTable,
    PlansAggregateTiles,
    rowsWithAnyPlan,
    usePlanAchievement,
    usePlansData,
} from '@/modules/feature/plans';

/**
 * Блок «Планы»: достижение целей руководителя (план пересчитан под
 * выбранный период) — сводная таблица с жидкими прогрессами, разбивка
 * по отделам/группам (Σ планов сотрудников) и победители по % достижения.
 *
 * Тумблер блока (ReportBlockWrapper) — та самая «единственная настройка»
 * рядового: скрыл блок → гаснут и план-аннотации таблиц, и планы в Excel.
 * Рядовой (без PLANS_VIEW_ALL) видит только свою строку.
 */
export const PlansBlock: React.FC = () => {
    const isPublic = useAppSelector(selectIsPublic);
    const { report } = useReport();
    const plans = usePlansData();

    const presentUserIds = useMemo(
        () => report.map(row => Number(row.user?.ID ?? row.id)),
        [report],
    );
    const scopedUserIds = useMemo(
        () =>
            plans.canViewAll
                ? presentUserIds
                : presentUserIds.filter(id => id === plans.currentUserId),
        [presentUserIds, plans.canViewAll, plans.currentUserId],
    );
    const achievement = usePlanAchievement(plans.indicators, scopedUserIds);
    // Сотрудники без единого плана в отчёте планов не участвуют.
    const planRows = rowsWithAnyPlan(achievement.rows);

    if (isPublic || !plans.canView || !plans.isConfigured) return null;
    if (!planRows.length) return null;

    const ratingDataset = buildPlanRatingDataset(plans.indicators, planRows);

    const renderSummary = () => (
        <>
            {/* Итого по команде — та же визуализация, что у сотрудника. */}
            {planRows.length > 1 && (
                <PlansAggregateTiles
                    indicators={plans.indicators}
                    cells={aggregateCells(plans.indicators, planRows)}
                    expected={achievement.expected}
                    title="Итого по команде"
                />
            )}
            <PlansAchievementTable
                indicators={plans.indicators}
                rows={planRows}
                totals={
                    planRows.length > 1
                        ? aggregateCells(plans.indicators, planRows)
                        : undefined
                }
                expected={achievement.expected}
            />
        </>
    );

    const renderSection = (userIds: Set<number>) => {
        const sectionRows = planRows.filter(row => userIds.has(row.userId));
        if (!sectionRows.length) {
            return (
                <p className="py-2 text-sm text-muted-foreground">
                    Нет данных за период
                </p>
            );
        }
        const sectionTotals = aggregateCells(plans.indicators, sectionRows);
        return (
            <>
                {/* Достигает ли отдел/группа план — плитки-итого секции. */}
                <PlansAggregateTiles
                    indicators={plans.indicators}
                    cells={sectionTotals}
                    expected={achievement.expected}
                    title="Итого по секции"
                />
                <PlansAchievementTable
                    indicators={plans.indicators}
                    rows={sectionRows}
                    totals={
                        sectionRows.length > 1 ? sectionTotals : undefined
                    }
                    expected={achievement.expected}
                />
            </>
        );
    };

    const ratingFooter = () => (_sections: StructureSection[]) => (
        <div className="mt-6">
            <EntityRatingChart
                title="Победители — выполнение плана (%)"
                dataset={ratingDataset}
            />
        </div>
    );

    return (
        <ReportBlockWrapper blockId={PLANS_BLOCK_ID} title="Планы">
            <ReportGroupTabs
                presentUserIds={planRows.map(row => row.userId)}
                renderSummary={renderSummary}
                renderSection={renderSection}
                renderDepartmentsFooter={ratingFooter()}
                renderGroupsFooter={ratingFooter()}
            />
        </ReportBlockWrapper>
    );
};
