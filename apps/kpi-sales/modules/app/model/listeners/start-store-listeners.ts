import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';

import { startReportFlowListeners } from '@/modules/feature/report-flow';
import { startUserReportAppListener } from '@/modules/entities/user-report/model/listeners/app.listener';
import { startMergedFilterListeners } from '@/modules/feature/merged-kpi-calling-report/model/listeners/merged-filter.listener';
import { startUiSettingsSyncListeners } from '@/modules/feature/ui-settings/model/listeners/ui-settings-sync.listener';
import { startFinanceWsListener } from '@/modules/entities/finance/model/listeners/finance-ws.listener';
import { startFinanceRefetchListener } from '@/modules/entities/finance/model/listeners/finance-refetch.listener';
import { startReportTypeAppListener } from '@/modules/feature/report-widget-type/model/ReportTypeAppListener';
import { startReportLinksListener } from '@/modules/feature/report-links/model/listeners/report-links.listener';
import { startSharePresenceListener } from '@/modules/feature/report-links/model/listeners/share-presence.listener';
import { startReportAwardsListener } from '@/modules/feature/report-awards';
import type { AppDispatch, RootState, ThunkExtraArgument } from '../store';

type AppListenerMiddleware = ListenerMiddlewareInstance<
    RootState,
    AppDispatch,
    ThunkExtraArgument
>;

/**
 * Единая точка регистрации listeners (реакции «X случилось → сделать Y»).
 * Цепочка загрузки: setAppData → структура отделов → сохранённый фильтр →
 * отчёт + статистика звонков. Thunks о слушателях не знают.
 */
export function startStoreListeners(listenerMiddleware: AppListenerMiddleware) {
    startReportTypeAppListener(listenerMiddleware);
    startUserReportAppListener(listenerMiddleware);

    startReportFlowListeners(listenerMiddleware);
    startMergedFilterListeners(listenerMiddleware);
    startReportAwardsListener(listenerMiddleware);
    startReportLinksListener(listenerMiddleware);
    startSharePresenceListener(listenerMiddleware);
    startFinanceWsListener(listenerMiddleware);
    startFinanceRefetchListener(listenerMiddleware);
    // Синк UI-настроек регистрируется последним: его гидратация должна
    // перекрывать доменные дефолты (например, тип отчёта).
    startUiSettingsSyncListeners(listenerMiddleware);
}
