import { appActions } from '@/modules/app/model/AppSlice';
import { RootState } from '@/modules/app/model/store';
import { getCurrentRq } from '@/modules/entities/deal';

import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { isAnyOf } from '@reduxjs/toolkit';
import { fetchBXRQ } from '@workspace/bx-rq';
import { IBXDeal } from '@bitrix/index';

export function setupRqAppListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (action, listenerApi) => {
            const { dispatch, getState } = listenerApi;
            const state = getState() as RootState;
            const domain = state.app.domain;
            const companyId = state.app.bitrix.company?.ID;
            const deal = state.app.bitrix.deal;
            const currentRqId =
                getCurrentRq(deal as IBXDeal) || (undefined as undefined);
            if (domain && companyId) {
                dispatch(fetchBXRQ(domain, companyId, currentRqId) as any);
            }
        },
    });
}
