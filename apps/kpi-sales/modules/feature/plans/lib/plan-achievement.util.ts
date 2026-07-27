/**
 * Сборка строк достижения планов: план (пересчитан на выбранный период) /
 * факт / % / ожидаемое сейчас. Чистые функции — UI и Excel-сборка
 * потребляют одинаково. Агрегация секций (отдел/группа) = Σ планов и
 * Σ фактов сотрудников (решение: план отдела = сумма планов людей).
 */
import type {
    PlanIndicatorConfig,
    PlanIndicatorMeta,
    PlanTargetsByCode,
} from '../model';
import { expectedShare, planForRange } from './plan-period.util';
import { PlanFactSources, planFact } from './plan-fact.util';

/** Включённый показатель с готовым отображаемым именем. */
export interface EnabledPlanIndicator extends PlanIndicatorMeta {
    displayName: string;
    periodType: PlanIndicatorConfig['periodType'];
}

/** Ячейка достижения: показатель × сотрудник (или агрегат). */
export interface PlanAchievementCell {
    code: string;
    /** План на выбранный период; null — не задан. */
    plan: number | null;
    fact: number;
    /** Достижение в долях (0.84); null — план не задан/нулевой. */
    percent: number | null;
}

export interface PlanAchievementRow {
    userId: number;
    userName: string;
    cells: PlanAchievementCell[];
}

/** Включённые показатели каталога + их портальные имена/периоды. */
export const enabledIndicators = (
    catalog: PlanIndicatorMeta[],
    configs: PlanIndicatorConfig[],
): EnabledPlanIndicator[] =>
    configs
        .filter(config => config.enabled)
        .flatMap(config => {
            const meta = catalog.find(item => item.code === config.code);
            if (!meta) return [];
            return [
                {
                    ...meta,
                    displayName: config.customName || meta.defaultName,
                    periodType: config.periodType,
                },
            ];
        });

/** Достижение одного сотрудника по включённым показателям. */
export const buildUserAchievementCells = (
    indicators: EnabledPlanIndicator[],
    targets: PlanTargetsByCode | undefined,
    sources: PlanFactSources,
    userId: number,
    fromISO: string,
    toISO: string,
): PlanAchievementCell[] =>
    indicators.map(indicator => {
        const rawTarget = targets?.[indicator.code] ?? null;
        const plan =
            rawTarget === null || rawTarget <= 0
                ? null
                : planForRange(
                      rawTarget,
                      indicator.periodType,
                      fromISO,
                      toISO,
                  );
        const fact = planFact(sources, indicator, userId);
        return {
            code: indicator.code,
            plan,
            fact,
            percent: plan ? fact / plan : null,
        };
    });

/** Агрегат ячеек (секция/итого): Σ планов (заданных) и Σ фактов. */
export const aggregateCells = (
    indicators: EnabledPlanIndicator[],
    rows: PlanAchievementRow[],
): PlanAchievementCell[] =>
    indicators.map((indicator, index) => {
        let planSum = 0;
        let hasPlan = false;
        let factSum = 0;
        rows.forEach(row => {
            const cell = row.cells[index];
            if (!cell) return;
            factSum += cell.fact;
            if (cell.plan !== null) {
                planSum += cell.plan;
                hasPlan = true;
            }
        });
        const plan = hasPlan ? Math.round(planSum * 100) / 100 : null;
        return {
            code: indicator.code,
            plan,
            fact: Math.round(factSum * 100) / 100,
            percent: plan ? factSum / plan : null,
        };
    });

/** Ожидаемая доля выполнения к «сейчас» для выбранного периода отчёта. */
export const planExpectedShare = (fromISO: string, toISO: string): number =>
    expectedShare(fromISO, toISO);

/**
 * Только сотрудники, у которых задан хотя бы один план: остальные в
 * отчёте планов не участвуют (ни в таблицах, ни в Excel).
 */
export const rowsWithAnyPlan = (
    rows: PlanAchievementRow[],
): PlanAchievementRow[] =>
    rows.filter(row => row.cells.some(cell => cell.plan !== null));

/**
 * Датасет «победители по % достижения» для EntityRatingChart
 * (values = проценты выполнения; без плана — строка не участвует).
 */
export const buildPlanRatingDataset = (
    indicators: EnabledPlanIndicator[],
    rows: PlanAchievementRow[],
): {
    actions: { code: string; name: string }[];
    rows: {
        userId: number;
        name: string;
        values: Record<string, number>;
    }[];
} => ({
    actions: indicators.map(indicator => ({
        code: indicator.code,
        name: indicator.displayName,
    })),
    rows: rows
        .filter(row => row.cells.some(cell => cell.percent !== null))
        .map(row => ({
            userId: row.userId,
            name: row.userName,
            values: Object.fromEntries(
                row.cells.map(cell => [
                    cell.code,
                    cell.percent === null
                        ? 0
                        : Math.round(cell.percent * 1000) / 10,
                ]),
            ),
        })),
});
