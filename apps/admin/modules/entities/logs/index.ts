/** Публичная поверхность раздела «Журналы». */
export { LogsPage } from './ui/LogsPage/LogsPage';
export { LOGS_QUERY_KEY, useLogRows, useLogsSummary } from './lib/hooks/use-logs';
export type { LogsFilter, LogsSummary, LogRow } from './model';
