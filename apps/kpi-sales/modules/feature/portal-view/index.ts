// Портальные настройки вида отчёта: скрытые вкладки, графики, главные бейджи,
// ссылка на поддержку. Загрузка — listener на setAppData; форма настроек —
// widgets/report-settings; графики прячет отдельная задача через
// useChartsEnabledSetting. Слайс и listener подключает стор прямыми путями.
export type {
    PortalViewBadgeGroup,
    PortalViewBadgeOption,
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
export { REPORT_SETTINGS_PATH } from './consts/portal-view.consts';
export { PORTAL_VIEW_TEXT } from './consts/portal-view.texts';
export {
    useCanEditPortalView,
    useChartsEnabledSetting,
    useHiddenTabs,
    usePortalView,
    useSupportUrl,
} from './hooks/use-portal-view';
export { ReportSettingsLink } from './ui/ReportSettingsLink';
export { SupportChatLink } from './ui/SupportChatLink';
