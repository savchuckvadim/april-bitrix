'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectIsPublic } from '@/modules/app';
import {
    useIndicatorLabeler,
    usePortalView,
} from '@/modules/feature/portal-view';
import type {
    TableRowsDecorator,
    TableTotalsDecorator,
} from '@/modules/shared/lib/table-decorators';
import { usePlansData } from './use-plans-data';
import { usePlanAchievement } from './use-plan-achievement';
import { planScopeUserIds } from '../lib/plan-achievement.util';
import type { PlanColumnsTab } from '../lib/plan-columns.consts';
import {
    achievementByUser,
    tablePlanColumnSpecs,
} from '../lib/plan-columns.util';
import {
    withPlanTableColumns,
    withPlanTotalColumns,
} from '../lib/plan-columns-table.util';

/** Колонки планов таблицы вкладки. */
export interface PlanColumns {
    /** Строки таблицы: колонка плана вплотную слева от своего факта. */
    applyToRows: TableRowsDecorator;
    /** Итоговая таблица: итог плана (сумма планов области видимости). */
    applyToTotals: TableTotalsDecorator;
    /** Коды плановых показателей с колонкой — подпись под фактом только «⌖ %». */
    planCodes: ReadonlySet<string>;
}

const NO_USERS: number[] = [];

/**
 * Колонки планов для таблицы вкладки (events — «Все»/«События», merged,
 * callings). Включены, если: не публичная страница, есть доступ к планам и
 * они настроены, пользователь видит планы всех (PLANS_VIEW_ALL), флаг
 * таблицы включён в настройках портала (личный тумблер блока «Планы» не
 * влияет). Рядовой колонок не видит — свой план у него подписью под фактом.
 * Выключено — undefined.
 */
export const usePlanColumns = (
    tab: PlanColumnsTab,
    visibleUserIds: number[],
): PlanColumns | undefined => {
    const isPublic = useAppSelector(selectIsPublic);
    const { view } = usePortalView();
    const plans = usePlansData();
    const labelOf = useIndicatorLabeler();

    const specs = useMemo(
        () =>
            tablePlanColumnSpecs(tab, plans.indicators, {
                isPublic,
                canView: plans.canView && plans.isConfigured,
                canViewAll: plans.canViewAll,
                flags: view,
                hiddenCodes: view.planColumnsHidden,
            }),
        [
            tab,
            plans.indicators,
            plans.canView,
            plans.canViewAll,
            plans.isConfigured,
            isPublic,
            view,
        ],
    );

    const scopedUserIds = useMemo(
        () =>
            specs.length
                ? planScopeUserIds(
                      visibleUserIds,
                      plans.canViewAll,
                      plans.currentUserId,
                  )
                : NO_USERS,
        [specs, visibleUserIds, plans.canViewAll, plans.currentUserId],
    );

    const achievement = usePlanAchievement(plans.indicators, scopedUserIds);

    return useMemo<PlanColumns | undefined>(() => {
        if (!specs.length) return undefined;
        const byUser = achievementByUser(achievement.rows);
        return {
            applyToRows: rows =>
                withPlanTableColumns(rows, specs, byUser, labelOf),
            applyToTotals: (columns, userIds) =>
                withPlanTotalColumns(columns, userIds, specs, byUser, labelOf),
            planCodes: new Set(specs.map(spec => spec.planCode)),
        };
    }, [specs, achievement.rows, labelOf]);
};
