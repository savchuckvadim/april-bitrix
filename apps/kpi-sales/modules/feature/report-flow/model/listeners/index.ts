import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { startDepartmentAppListener } from './department-app.listener';
import { startReportChainListeners } from './report-chain.listener';
import { startReportQueueWsListener } from './report-queue-ws.listener';

/**
 * Listeners всего flow отчёта:
 * setAppData → структура отделов → сохранённый фильтр → отчёт + звонки;
 * плюс WS-доставка готовых queue-расчётов (kpi-report:done и др.).
 */
export const startReportFlowListeners = (
    listenerMiddleware: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    startDepartmentAppListener(listenerMiddleware);
    startReportChainListeners(listenerMiddleware);
    startReportQueueWsListener(listenerMiddleware);
};
