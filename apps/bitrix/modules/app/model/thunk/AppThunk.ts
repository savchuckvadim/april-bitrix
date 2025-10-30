import {
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from "../../consts/app-global";
import { appActions } from "../slice/AppSlice";
import { AppDispatch, AppGetState } from "../store";
import { Bitrix } from '@workspace/bitrix';

import { Placement } from "@workspace/bx";
import { bxAppHelper } from "@/modules/entities/bx-app/lib/bx-app.helper";

export const initial = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    // startListeners()
    // __IN_BITRIX__ && (await bitrixAPI.getFit());



    const state = getState();
    const isLoading = state.app.isLoading;
    console.log('app init thunk')

    if (!isLoading) {
        console.log('app initial')
        const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
        await bitrix.api.getFit();
        const bitrixAuthData = bitrix.api.getInitializedData()
  

        dispatch(appActions.isLoading({ status: true }))


        dispatch(appActions.setInitializedSuccess({}));

        dispatch(appActions.isLoading({ status: false }))
    }
};


export const reloadApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {

    // dispatch(
    //     preloaderActions
    //         .setPreloader({ status: true })
    // )

    // setTimeout(() => {

    //     dispatch(eventActions.setCurrentPage(
    //         { page: ROUTE_EVENT.LIST }
    //     ))
    //     dispatch(
    //         // initialEventApp()
    //         appActions.reload()
    //     )
    //     dispatch(
    //         preloaderActions
    //             .setPreloader({ status: false })
    //     )

    // }, 3200)

}
