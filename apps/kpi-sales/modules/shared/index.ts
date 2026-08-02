// Спиннер консолидирован в @workspace/april-ui (локальная копия удалена;
// в ней размер large задавался несуществующим классом h-18) — реэкспорт
// под прежним именем для существующих импортов.
export { Spinner as Preloader } from '@workspace/april-ui/feedback';
export { Processing } from './processing/ui/Processing';
export { ProcessingModern } from './processing/ui/variants/ProcessingModern';
export { ProcessingAurora } from './processing/ui/variants/ProcessingAurora';
export { ProcessingLiquid } from './processing/ui/variants/ProcessingLiquid';
export { ProcessingBends } from './processing/ui/variants/ProcessingBends';
export { GradientCountdown } from '@workspace/april-ui/feedback';
export * from './lib/ui-settings-touch';
// RTable консолидирован в @workspace/april-ui (единственная реализация;
// прежняя локальная копия удалена) — реэкспорт для существующих импортов.
export { RTable } from '@workspace/april-ui';
export type { RTableProps, RTableAnnotation } from '@workspace/april-ui';
export {
    CompanyColorBadge,
    companyColorLabel,
} from './ui/CompanyColorBadge';
export type { CompanyPerspectiveColor } from './ui/CompanyColorBadge';
export { GlassActionStatus } from './ui/GlassActionStatus';
export type { GlassActionStatusKind } from './ui/GlassActionStatus';

export * from './telegram/type/telegram.type';
export * from './telegram/lib/tlegram-bot';
export * from './lib/hooks/use-persisted-selection';
export * from './lib/merged-actions.util';
