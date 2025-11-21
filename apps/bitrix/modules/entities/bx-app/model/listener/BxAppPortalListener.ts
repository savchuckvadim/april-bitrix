import { portalActions } from "@/modules/entities/portal/model";
import { authActions } from "@/modules/processes/auth";
import { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { BitrixAppDto } from "@workspace/nest-api";
import { bxAppActions } from "../slice/BxAppSlice";
import { bxAppHelper } from "../../lib/bx-app.helper";



export const startBxAppPortalListener = (listener: ListenerMiddlewareInstance) => {

    listener.startListening({
        actionCreator: portalActions.setSelectedPortal,
        effect: async (action, listenerApi) => {
            console.log('setSelectedPortal', action);

            const portalId = action.payload?.id;
            if (!portalId) {
                return;
            }
            const response = await bxAppHelper.getPortalApps(portalId);
            const bxApps = response as BitrixAppDto[];
            listenerApi.dispatch(bxAppActions.setBxApps(bxApps));
        },
    });

    listener.startListening({
        actionCreator: authActions.logout,
        effect: (action, listenerApi) => {

            listenerApi.dispatch(bxAppActions.clear());
        },
    });
};
