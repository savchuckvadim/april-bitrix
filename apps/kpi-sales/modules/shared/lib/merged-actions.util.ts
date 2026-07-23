/**
 * Компоновка объединённого отчёта: какие KPI-действия попадают в merged
 * (без «План», «Результативные» и звонковых — звонки берутся из
 * фактической статистики). Используется таблицей merged и рейтингами.
 */
export const getIsFiltredKpiReportForMergedReport = (
    actionName: string,
): boolean => {
    return (
        actionName !== 'План' &&
        actionName !== 'Результативные' &&
        !actionName.toLowerCase().includes('звонок')
    );
};
