/** Публичная поверхность раздела «Поддержка клиентов». */
export { SupportGuidePage } from './ui/SupportGuidePage/SupportGuidePage';
export {
    SUPPORT_QUERY_KEY,
    useSupportDialogStats,
    useSupportGuide,
    useSupportOpenDialogs,
    useSupportPreview,
} from './lib/hooks/use-support';
export type {
    SupportDialogHistoryItem,
    SupportDialogReport,
    SupportDialogStats,
    SupportGuide,
    SupportMonitorPreview,
} from './model';
