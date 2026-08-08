// Публичная поверхность сущности «история работы по клиенту».
export * from './model/EVHistorySlice';
export * from './model/EVHistoryThunk';
export * from './model/history-record.type';
export { usePortalHistory } from './lib/hooks/use-portal-history';
export type { PortalHistory } from './lib/hooks/use-portal-history';
export { getHistoryListRef } from './lib/history-list';
