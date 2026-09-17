// Публичная поверхность вкладки «ИНН» карточки сделки.
export * from './model';
export { useInnDeal, INN_DEAL_QUERY_ROOT } from './lib/hooks/use-inn-deal';
export type { InnDealState } from './lib/hooks/use-inn-deal';
export { InnDealPanel } from './ui/InnDealPanel';
