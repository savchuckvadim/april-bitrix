import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';

import {
    RQ_TYPE,
    saveAddressCreating,
    saveBankCreating,
    saveBaseCreating,
    setCurrentItem,
    setCurrentRqItems,
    setFetched,
} from '@workspace/bx-rq';
import { RootState } from '@/modules/app/model/store';
import { appActions } from '@/modules/app/model/AppSlice';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { setCurrentRqThunk } from '../thunk/CurrentRqThunk';

// export const rqListener = createListenerMiddleware()
export function setupCurrentRqListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(
            // setFetched,
            setCurrentItem,
            setCurrentRqItems,
            saveBaseCreating,
            // The bitrix deal now lives in the app slice; react when it is set
            // (replaces the removed deal-slice `setDealData`).
            appActions.setAppData,
            // saveAddressCreating,
            // saveBankCreating,
        ),

        effect: async (action, listenerApi) => {
            const { getState } = listenerApi;

            // const state = getState() as RootState;
            // const currentItem = state.bxrq?.current?.item;

            // const dealData = state.deal.dealData;
            // let currentClientType = RQ_TYPE.ORGANIZATION;
            // if (dealData) {
            //     currentClientType = getDealClientType(dealData) || RQ_TYPE.ORGANIZATION;
            // }

            listenerApi.dispatch(setCurrentRqThunk());
        },
    });
}
