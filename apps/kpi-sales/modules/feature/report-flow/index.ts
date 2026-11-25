// Фича-оркестратор отчёта: кросс-entity thunks (department + report +
// calling-statistics + сохранённые фильтры), listener-цепочка загрузки и
// черновик фильтра (панель правит его, «Применить» переносит в действующий
// фильтр). Слайс черновика подключает стор прямым путём. Запросы отчёта идут
// «по необходимости»: карта нужд вкладки решает, какие данные запрашивать и
// что блокирует страницу.
export * from './model/report-flow-thunks';
export * from './model/calling-statistics-flow-thunk';
export * from './model/ensure-report-data.thunk';
export { getReportDataNeeds } from './lib/report-data-needs.util';
export type { ReportDataNeeds } from './lib/report-data-needs.util';
export * from './model/listeners';
export * from './model/filter-draft/report-filter-draft.thunks';
export { reportFilterDraftActions } from './model/filter-draft/report-filter-draft.slice';
export type {
    ReportFilterDraftState,
    ReportFilterValues,
} from './model/filter-draft/report-filter-draft.types';
export * from './hooks/use-report-flow';
export * from './hooks/use-save-filter';
export * from './hooks/use-report-filter-draft';
export * from './hooks/use-report-filter-panel';
export * from './hooks/use-report-data-demand';
