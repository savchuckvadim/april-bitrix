import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { setFetched } from '@workspace/bx-rq';

/**
 * TODO(@alfa migration): the client-type listener reacted to deal-field updates
 * and dispatched DealSlice actions (`updateFieldValue`) + `updateDealField` to
 * sync the bitrix `organization_type` field with the resolved RQ type. That
 * logic depends on deal-field data and DealSlice members that are mid-migration,
 * so the effect is stubbed to a no-op. (This listener is also not yet registered
 * in `startStoreListeners`.) Restore once the deal model is settled.
 */
export function setupClientTypeListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        actionCreator: setFetched,
        effect: async () => {
            // no-op (WIP)
        },
    });
}
