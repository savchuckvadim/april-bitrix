// Портальные настройки вида отчёта: скрытые вкладки, графики, главные бейджи,
// свои названия показателей, колонки планов, ссылка на поддержку. Загрузка —
// listener на setAppData (на /share — только названия из ответа ссылки);
// форма настроек — widgets/report-settings; графики прячет отдельная задача
// через useChartsEnabledSetting. Слайс и listener подключает стор прямыми путями.
export type {
    PortalViewBadgeGroup,
    PortalViewBadgeOption,
    PortalViewIndicator,
    PortalViewIndicatorGroup,
    PortalViewMethodology,
    PortalViewOptions,
    PortalViewResponse,
    PortalViewSaveBody,
    PortalViewSettings,
    PortalViewTabOption,
} from './model/types';
export type { PortalViewState } from './model/portal-view-slice';
export { loadPortalView, savePortalView } from './model/portal-view-thunks';
export { portalViewActions } from './model/portal-view-slice';
export { selectIndicatorLabeler } from './model/portal-view.selectors';
export { publicViewLabels } from './lib/portal-view-labels-normalize';
export {
    PORTAL_VIEW_LABEL_MAX_LENGTH,
    REPORT_SETTINGS_PATH,
} from './consts/portal-view.consts';
export { PORTAL_VIEW_TEXT } from './consts/portal-view.texts';
export {
    REPORT_SETTINGS_FROM,
    REPORT_SETTINGS_FROM_PARAM,
    parseReportSettingsFrom,
    reportSettingsHref,
} from './lib/report-settings-nav';
export type { ReportSettingsFrom } from './lib/report-settings-nav';
export {
    useCanEditPortalView,
    useChartsEnabledSetting,
    useHiddenTabs,
    useIndicatorLabeler,
    usePortalView,
    useSupportUrl,
} from './hooks/use-portal-view';
export { ReportSettingsLink } from './ui/ReportSettingsLink';
export { SupportChatLink } from './ui/SupportChatLink';
