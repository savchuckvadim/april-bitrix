import type {
    AiAnalyticsForecastBacktestDto,
    AiForecastBreakdownDepartmentDto,
    AiForecastBreakdownDepartmentDtoMethod,
    AiForecastBreakdownFlowDto,
    AiForecastBreakdownFlowDtoStatus,
    AiForecastBreakdownManagerDto,
    AiForecastBreakdownManagerFlowDto,
    AiForecastBreakdownManagerFlowDtoSource,
    AiForecastBreakdownResultDto,
} from '@workspace/nest-admin-api';

/*
 * Доменные алиасы прогноза с 18.11.2026 (расчёт от отмеченных презентаций).
 * Формы — из сгенерированного клиента `nest-admin-api`.
 */

/** Метод расчёта: от презентаций или старый — по звонкам. */
export type ModelForecastMethod = AiForecastBreakdownDepartmentDtoMethod;

/** Итог подбора: сдвиг подобран, по умолчанию, презентации не отмечаются. */
export type ModelForecastFlowStatus = AiForecastBreakdownFlowDtoStatus;

/** Откуда ожидание сотрудника: презентации или свои средние продажи. */
export type ModelForecastFlowSource = AiForecastBreakdownManagerFlowDtoSource;

/** Подбор прогноза от презентаций по отделу. */
export type ModelForecastBreakdownFlow = AiForecastBreakdownFlowDto;

/** Входы прогноза от презентаций по сотруднику. */
export type ModelForecastBreakdownManagerFlow = AiForecastBreakdownManagerFlowDto;

/** Отдел в разложении: старые поля и расчёт от презентаций. */
export type ModelForecastBreakdownDepartment = AiForecastBreakdownDepartmentDto;

/** Сотрудник в разложении: сделки справочно и входы от презентаций. */
export type ModelForecastBreakdownManager = AiForecastBreakdownManagerDto;

/** Ответ «Разложения прогноза». */
export type ModelForecastBreakdownResult = AiForecastBreakdownResultDto;

/** Проверка точности: по какому расчёту и сколько месяцев старого вне её. */
export type ModelForecastBacktest = AiAnalyticsForecastBacktestDto;
