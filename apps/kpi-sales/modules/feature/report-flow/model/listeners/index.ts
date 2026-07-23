import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { startDepartmentAppListener } from './department-app.listener';
import { startReportChainListeners } from './report-chain.listener';

/**
 * Listeners всего flow отчёта:
 * setAppData → структура отделов → сохранённый фильтр → отчёт + звонки.
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
};
