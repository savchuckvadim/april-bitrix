/**
 * Outbox отправки отчётов (план А3): конверт пишется в KV-хранилище awaited
 * ДО первого HTTP, доставляется по реестру адресов (сегодня — основной бэк)
 * и досылается дренажем после рестарта вкладки. UI слайса — тонкая полоска
 * недоставленных в списке; финиш-стадии живут во flowStatus.
 */
export * from './lib/outbox-envelope';
export * from './lib/outbox-store';
export * from './lib/delivery-targets';
export * from './lib/outbox-lock';
export * from './lib/outbox-delivery';
export * from './lib/report-outcome';
export * from './lib/direct-capability';
export * from './lib/direct-delivery';
export * from './lib/outbox-notice';
export * from './lib/hooks/use-outbox-notice';
export * from './model/OutboxSlice';
export * from './model/OutboxThunk';
export * from './model/DirectDeliveryThunk';
export * from './model/OutboxDrainThunk';
export * from './model/OutboxDrainListener';
export { OutboxNoticeBanner } from './ui/OutboxNoticeBanner';
