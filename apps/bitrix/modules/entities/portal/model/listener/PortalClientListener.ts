import { authActions } from "@/modules/processes/auth";
import { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { getBitrixAppClientClient } from "@workspace/nest-api";
import { portalActions } from "../slice/PortalSlice";


export const startPortalClientListener = (listener: ListenerMiddlewareInstance) => {

    listener.startListening({
        actionCreator: authActions.setCurrentUser,
        effect: async (action, listenerApi) => {
            console.log('setSelectedPortal', action);
            const portalApi = getBitrixAppClientClient()
            const client = action.payload?.currentClient ?? null;
            const clientId = client?.id;

            if (!clientId || !client) {
                return;
            }
            const response = await portalApi.bitrixClientGetClientPortals({
                clientId: Number(clientId),
            })
            const portals = response as unknown as { id: number, domain: string, name: string, }[];
            const currentPortal = portals?.[0] ?? null;
            if (currentPortal) {
                listenerApi.dispatch(portalActions.setPortals(portals));
                listenerApi.dispatch(portalActions.setSelectedPortal(currentPortal));
            }
        },
    });

    listener.startListening({
        actionCreator: authActions.logout,
        effect: (action, listenerApi) => {
            console.log('setSelectedPortal', action);

            listenerApi.dispatch(portalActions.setPortals([]));
            listenerApi.dispatch(portalActions.setSelectedPortal(null));
        },
    });
};
