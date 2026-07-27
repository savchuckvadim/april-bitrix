// Виджет отчёта, разбит на под-виджеты (у каждого свои ui/hooks/lib):
//   report-provider — каркас: sticky-хедер, фильтры, состояния загрузки
//   report-header   — хедер: период, Поделиться/Скачать/фильтры
//   report-filter   — карточка фильтров (даты/отделы/события)
//   report-view     — тело отчёта: блоки по типу отчёта
// Общее для под-виджетов — в lib/.
export { Report } from './report-view';
export { ReportProvider } from './report-provider';
