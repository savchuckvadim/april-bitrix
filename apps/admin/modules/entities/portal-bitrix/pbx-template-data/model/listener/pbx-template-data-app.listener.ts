import { appActions } from "@/modules/app/model/slice/AppSlice";
import { AppDispatch, RootState, ThunkExtraArgument } from "@/modules/app/model/store";
import { isAnyOf, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { fetchInitialPbxTemplateDataThunk } from "../thunk/fetch-initial-pbx-template-data.thunk";

export const startPbxTemplateDataAppListener = (
    listener: ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>,
    // wsClient: WSClient
) => {

    listener.startListening({
        matcher: isAnyOf(
            appActions.setInitializedSuccess,


        ),

        effect: async (action, { extra, dispatch, getState, }) => {

            
            dispatch(fetchInitialPbxTemplateDataThunk());



        },
    });

}
