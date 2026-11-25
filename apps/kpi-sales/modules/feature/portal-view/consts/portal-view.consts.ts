import type { PortalViewSettings } from '../model/types';

/** Ручки вида отчёта на бэке kpi-report-sales. */
export const PORTAL_VIEW_GET_URL = '/api/kpi-report/portal-view/get';
export const PORTAL_VIEW_SAVE_URL = '/api/kpi-report/portal-view/save';

/** Страница настроек отчёта (без обвязки отчёта, как «Разборы звонков»). */
export const REPORT_SETTINGS_PATH = '/settings';

/** Безопасные значения до ответа бэка и при его сбое: ничего не скрыто, графики есть. */
export const defaultPortalViewSettings = (): PortalViewSettings => ({
    tabsHidden: [],
    chartsEnabled: true,
    badgesMain: [],
    updatedBy: null,
    updatedAt: null,
});
