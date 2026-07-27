// Публичный контракт сущности «KPI-отчёт»: состояние, чистые операции,
// api-хелперы, типы и собственный UI (таблицы/чарты/фильтры дат-действий).
// Оркестрация загрузки — в feature/report-flow; композиция — widgets/report.

// model
export { useReport } from './model';
export type { ReportState } from './model';
export { reportActions } from './model';
export * from './model/report-thunks';
export * from './model/types/report/report-type';

// api
export { ReportHelper } from './lib/api/report-helper';
export { ReportFilterHelper } from './lib/api/filter-helper';

// lib
export { getFiltredrReport, getTotalData, getMediumData } from './lib/report';
export { getReportTableData } from './lib/ui-util';
export { getBlockState, setBlockState } from './lib/localStorage-util';
export { getColors, getChartColorsArray } from './lib/colors';
export * from './lib/export-util';
export * from './lib/date-util';

// ui
export { default as KPIReportTable } from './ui/Tables/KPIReportTable';
export { KPIReportTotalTable } from './ui/Tables/KPIReportTotalTable';
export { default as Graphics } from './ui/Graphics';
export { KPIReportTotalChart } from './ui/charts/KPIReportTotalChart';
export { KPISingleActionChart } from './ui/charts/KPISingleActionChart';
export { ReportBlockWrapper } from './ui/components/ReportBlockWrapper';
export { default as NoreportData } from './ui/components/NoreportData';
export { default as DatesFilter } from './ui/DatesFilter';
export { default as ActionsFilter } from './ui/ActionsFilter';
