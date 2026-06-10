import { startPbxTemplateDataAppListener } from '@/modules/entities';
import { startPortalBitrixClientListener } from '@/modules/entities/portal';
import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { AppDispatch, RootState, ThunkExtraArgument } from '../store';

export function startStoreListeners(
    listenerMiddleware: ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>,
) {
    startPbxTemplateDataAppListener(listenerMiddleware);
    startPortalBitrixClientListener(listenerMiddleware);
}
