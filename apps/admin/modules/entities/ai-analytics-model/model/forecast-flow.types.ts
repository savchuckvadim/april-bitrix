import type {
    AiAnalyticsForecastBacktestDto,
    AiForecastBreakdownDepartmentDto,
    AiForecastBreakdownManagerDto,
    AiForecastBreakdownResultDto,
} from '@workspace/nest-admin-api';

/*
 * Поля ответов прогноза с 18.11.2026 (расчёт от отмеченных презентаций).
 * Клиент `nest-admin-api` их ещё не знает (orval не перегенерирован) —
 * описаны здесь необязательными: старый бэкенд их не присылает, и карточки
 * тогда показывают старый расчёт. После перегенерации клиента эти
 * расширения можно заменить сгенерированными типами.
 */

/** Метод расчёта: от презентаций или старый — по звонкам. */
export const MODEL_FORECAST_METHODS = ['calls-v1', 'presentations-v2'] as const;
export type ModelForecastMethod = (typeof MODEL_FORECAST_METHODS)[number];

/** Итог подбора: сдвиг подобран, по умолчанию, презентации не отмечаются. */
export type ModelForecastFlowStatus =
    | 'estimated'
    | 'default-lag'
    | 'not-applicable';

/** Откуда ожидание сотрудника: презентации или свои средние продажи. */
export type ModelForecastFlowSource = 'presentations' | 'sales-history';

/** Подбор прогноза от презентаций по отделу. */
export interface ModelForecastBreakdownFlow {
    status: ModelForecastFlowStatus;
    reason: string | null;
    entry: 'presentation-uniq' | 'presentation' | null;
    /** Продаж на презентацию. */
    q: number;
    rho: number;
    /** Сдвиг продажи подобран по истории; false — по умолчанию. */
    lagEstimated: boolean;
    /** Сотрудников, посчитанных по своим продажам. */
    salesHistoryManagers: number;
}

/** Входы прогноза от презентаций по сотруднику. */
export interface ModelForecastBreakdownManagerFlow {
    source: ModelForecastFlowSource;
    presentationsDone: number;
    presentationsRate: number;
    salesPerPresentation: number;
    sameMonthShare: number;
    remainingShare: number;
    pastPresentations: number;
    salesMean: number | null;
}

/** Отдел в разложении: старые поля и расчёт от презентаций. */
export type ModelForecastBreakdownDepartment = AiForecastBreakdownDepartmentDto & {
    method?: ModelForecastMethod;
    flow?: ModelForecastBreakdownFlow | null;
};

/** Сотрудник в разложении: сделки справочно и входы от презентаций. */
export type ModelForecastBreakdownManager = AiForecastBreakdownManagerDto & {
    method?: ModelForecastMethod;
    /** Ожидание от открытых сделок — справочно, в прогноз не входит. */
    deals?: number | null;
    flow?: ModelForecastBreakdownManagerFlow | null;
};

/** Ответ «Разложения прогноза» с расширенными отделом и сотрудниками. */
export type ModelForecastBreakdownResult = Omit<
    AiForecastBreakdownResultDto,
    'department' | 'managers'
> & {
    department: ModelForecastBreakdownDepartment | null;
    managers: ModelForecastBreakdownManager[];
};

/** Проверка точности: по какому расчёту и сколько месяцев старого вне её. */
export type ModelForecastBacktest = AiAnalyticsForecastBacktestDto & {
    method?: ModelForecastMethod;
    otherMethodMonths?: number;
};
