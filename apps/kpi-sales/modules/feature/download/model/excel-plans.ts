/**
 * Планы для Excel из стора (зеркало UI): включённые показатели, доступ и
 * достижение сотрудников области видимости среди выгружаемых строк.
 * Из них собираются и колонки планов основного листа, и лист «Планы».
 */
import type { RootState } from '@/modules/app/model/store';
import { selectIsPublic } from '@/modules/app/model/selectors';
import { selectAccessContext } from '@/modules/app/lib/access/use-access';
import { checkAccess, EAccessFeature } from '@/modules/shared/access';
import type { ReportData } from '@/modules/entities/report';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import { financeEmployeeName } from '@/modules/entities/finance';
import {
    buildUserAchievementCells,
    enabledIndicators,
    planScopeUserIds,
    type EnabledPlanIndicator,
    type PlanAchievementRow,
} from '../../plans/lib/plan-achievement.util';
import type { PlanFactSources } from '../../plans/lib/plan-fact.util';
import type { PlanColumnsTab } from '../../plans/lib/plan-columns.consts';
import {
    tablePlanColumnSpecs,
    type PlanColumnSpec,
} from '../../plans/lib/plan-columns.util';

export interface ExcelPlansContext {
    /** Включённые показатели с портальными названиями и периодами. */
    indicators: EnabledPlanIndicator[];
    /** Доступ к планам (PLANS_VIEW). */
    canView: boolean;
    /** Видит планы всех (PLANS_VIEW_ALL) — колонки планов только у него. */
    canViewAll: boolean;
    /**
     * Достижение сотрудников области видимости (рядовой — только своя
     * строка); без доступа или без показателей — пусто.
     */
    rows: PlanAchievementRow[];
}

/** Планы выгружаемых сотрудников visibleIds. */
export const selectExcelPlansContext = (
    state: RootState,
    report: ReportData[],
    callings: ReportCallingData[],
    visibleIds: readonly number[],
): ExcelPlansContext => {
    const accessCtx = selectAccessContext(state);
    const canView = checkAccess(EAccessFeature.PLANS_VIEW, accessCtx);
    const indicators = enabledIndicators(
        state.plans.catalog,
        state.plans.indicators,
    );
    const canViewAll = checkAccess(EAccessFeature.PLANS_VIEW_ALL, accessCtx);
    if (!canView || !indicators.length) {
        return { indicators, canView, canViewAll, rows: [] };
    }
    const scopedIds = planScopeUserIds(
        visibleIds,
        canViewAll,
        Number(state.department.currentUser?.userId ?? 0),
    );
    const factSources: PlanFactSources = {
        report,
        callings,
        airtime: state.airtime.team.data,
        financeEmployees: state.finance.closed.report?.employees ?? [],
    };
    const { from, to } = state.report.date;
    const rows = scopedIds.map(userId => ({
        userId,
        userName: financeEmployeeName(state.department.items, userId),
        cells: buildUserAchievementCells(
            indicators,
            state.plans.targetsByUser[userId],
            factSources,
            userId,
            from,
            to,
        ),
    }));
    return { indicators, canView, canViewAll, rows };
};

/**
 * Колонки планов выгружаемой таблицы: флаг таблицы из настроек портала,
 * скрытые коды, доступ; на публичной странице — нет.
 */
export const selectExcelPlanColumnSpecs = (
    state: RootState,
    tab: PlanColumnsTab,
    context: ExcelPlansContext,
): PlanColumnSpec[] =>
    tablePlanColumnSpecs(tab, context.indicators, {
        isPublic: selectIsPublic(state),
        canView: context.canView,
        canViewAll: context.canViewAll,
        flags: state.portalView.view,
        hiddenCodes: state.portalView.view.planColumnsHidden,
    });
