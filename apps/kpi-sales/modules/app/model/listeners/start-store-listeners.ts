import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { startDepartmentAppListener } from '@/modules/entities/department/model/listeners/department-app.listener';
import { startReportChainListeners } from '@/modules/entities/report/model/listeners/report-chain.listener';
import { startUserReportAppListener } from '@/modules/entities/user-report/model/listeners/app.listener';
import { startReportTypeAppListener } from '@/modules/feature/report-widget-type/model/ReportTypeAppListener';
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
    startDepartmentAppListener(listenerMiddleware);
    startReportChainListeners(listenerMiddleware);
}
