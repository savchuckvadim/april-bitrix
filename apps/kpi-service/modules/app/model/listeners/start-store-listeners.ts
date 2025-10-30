import { startUserReportAppListener } from '@/modules/entities';
import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { AppDispatch, RootState, ThunkExtraArgument } from '../store';



export function startStoreListeners(
    listenerMiddleware: ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>,
) {

    startUserReportAppListener(listenerMiddleware);
}
