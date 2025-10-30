// Основной компонент
export { DealsReportTimelineCompact } from './DealsReportTimelineCompact';

// Компоненты
export { PeriodFilterComponent } from './components/PeriodFilter';
export { TimelineModeSelector } from './components/TimelineModeSelector';
export { CompanyStatsComponent } from './components/CompanyStats';
export { TimelineCell } from './components/TimelineCell';
export { MonthlyRevenueChart } from './components/MonthlyRevenueChart';

// Фичи
export { TimelineTable } from './features/TimelineTable';

// Redux
export {
    setPeriodFilter,
    setTimelineMode,
    toggleCompany,
    setExpandedCompanies,
    resetTimeline
} from './model/slice/TimeLineTableSlice';
export { timelineReducer } from './model/slice/TimeLineTableSlice';

// Типы
export type {
    PeriodFilter,
    TimelineMode,
    TimelineState,
    CompanyStats,
    YearlyData,
    MonthlyPayment,
    MonthRange,
    PeriodRange
} from './model/types';

// Утилиты
export {
    getMonthsOfYear,
    getMonthsOfPeriod,
    getYearsInPeriod,
    getMonthlyLabels,
    getMinDateFromDeals,
    calculateMonthlyPayments,
    calculateCompanyStats,
    calculateYearlyMatrix,
    calculateIndexGrowth,
    getDealColor
} from './lib/utils/timeline.utils';

export {
    calculateImplementationIndex,
    calculateMonthlyIndexData,
    calculateHeatmapData,
    getHeatmapColor
} from './lib/utils/analytics.utils';
export { ImplementationAnalytics } from './components/ImplementationAnalytics';
