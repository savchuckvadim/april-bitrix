import type { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState, ThunkExtraArgument } from '@/modules/app/model/store';
import { fetchCurrentPortal } from '../thunk/curent-portal.thunk';
import { bitrixPortalClient } from '@/modules/entities/bitrix/bitrix-client';

/**
 * Listens for portal changes (fetchCurrentPortal.fulfilled) and
 * invalidates the cached BitrixService for the old portal domain.
 *
 * Why: BitrixService instances are cached per-domain in bitrixPortalClient.
 * When the user navigates to a different portal we should clear the old
 * client so any new queries get a freshly initialised instance bound to the
 * correct domain credentials.
 */
export function startPortalBitrixClientListener(
    listener: ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>,
) {
    listener.startListening({
        actionCreator: fetchCurrentPortal.fulfilled,
        effect: (action, { getState }) => {
            const prevPortal = getState().portal.current;
            const nextPortal = action.payload.portal;

            const prevDomain = prevPortal?.domain;
            const nextDomain = nextPortal?.domain;

            // Invalidate the old client only when the domain actually changes.
            if (prevDomain && prevDomain !== nextDomain) {
                bitrixPortalClient.invalidate(prevDomain);
            }
        },
    });
}
