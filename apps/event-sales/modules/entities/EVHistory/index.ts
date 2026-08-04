// Публичная поверхность сущности «история работы по клиенту».
export * from './model/EVHistorySlice';
export * from './model/EVHistoryThunk';
export { usePortalHistory } from './lib/hooks/use-portal-history';
export type { PortalHistory } from './lib/hooks/use-portal-history';
export { getHistoryListRef } from './lib/history-list';
export type { HistoryEntry } from './lib/history-list';
