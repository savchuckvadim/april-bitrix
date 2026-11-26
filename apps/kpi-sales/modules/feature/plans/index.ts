export { plansReducer } from './model/plans-slice';
export { loadPlansData } from './model/plans-thunks';
export { usePlansData } from './hooks/use-plans-data';
// Включённые показатели планов без запуска загрузки (страница настроек отчёта)
export { useLoadedEnabledPlanCodes } from './hooks/use-loaded-enabled-plan-codes';
export { usePlanAchievement } from './hooks/use-plan-achievement';
export { useHasUserPlans } from './hooks/use-has-user-plans';
export { PlansSettingsControl } from './ui/PlansSettingsControl';
export { PlansAchievementTable } from './ui/PlansAchievementTable';
export { PlansAggregateTiles } from './ui/PlansAggregateTiles';
export { PlanProgressCell } from './ui/PlanProgressCell';
export { UserPlansProgress } from './ui/UserPlansProgress';
export {
    aggregateCells,
    buildPlanRatingDataset,
    buildUserAchievementCells,
    enabledIndicators,
    planExpectedShare,
    planScopeUserIds,
    rowsWithAnyPlan,
} from './lib/plan-achievement.util';
export type { PlanFactSources } from './lib/plan-fact.util';
export { usePlanAnnotations } from './hooks/use-plan-annotations';
// Колонки планов слева от факта: таблицы вкладок, итоги, строки Excel
export { usePlanColumns } from './hooks/use-plan-columns';
export type { PlanColumns } from './hooks/use-plan-columns';
export {
    achievementByUser,
    defaultPlanColumnLabel,
    insertPlanColumns,
    planCellValue,
    planColumnHint,
    planColumnLabel,
    tablePlanColumnSpecs,
} from './lib/plan-columns.util';
export type {
    PlanColumnSpec,
    PlanColumnsGate,
    PlanColumnValue,
} from './lib/plan-columns.util';
export type { PlanColumnsTab } from './lib/plan-columns.consts';
export { usePlansVisibility } from './hooks/use-plans-visibility';
export { PLANS_BLOCK_ID } from './lib/plans.data';
export type {
    EnabledPlanIndicator,
    PlanAchievementCell,
    PlanAchievementRow,
} from './lib/plan-achievement.util';
export {
    buildPlanAnnotations,
    mergePlanAnnotations,
} from './lib/plan-annotations.util';
export {
    buildPlansExcelPayload,
    type PlansExcelPayload,
} from './lib/plan-excel.util';
export { formatPlanPercent, formatPlanValue, planTone } from './lib/plans.data';
// Пересчёт цели на произвольный диапазон — нужен дневному дайджесту.
export { planForRange } from './lib/plan-period.util';
