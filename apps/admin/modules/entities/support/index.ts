/** Публичная поверхность раздела «Поддержка клиентов». */
export { SupportGuidePage } from './ui/SupportGuidePage/SupportGuidePage';
export {
    SUPPORT_QUERY_KEY,
    useSupportGuide,
    useSupportOpenDialogs,
    useSupportPreview,
} from './lib/hooks/use-support';
export type {
    SupportDialogReport,
    SupportGuide,
    SupportMonitorPreview,
} from './model';
