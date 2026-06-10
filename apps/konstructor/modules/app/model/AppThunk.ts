import { appActions } from './AppSlice';
import {
    AppDispatch,
    AppGetState,
    AppThunk,
    listenerMiddleware,
} from './store';

import { appInit } from '../lib/initialize/app-init/app-init.util';
import { startStoreListeners } from './listeners/start-store-listeners';

import { fetchBaseTemplate } from '@/modules/entities/base-template';
import { fetchOfferTemplates } from '@/modules/entities/offer-template/model/OfferTemplateThunk';
import { Bitrix } from '@bitrix/bitrix';
import { TESTING_DOMAIN, TESTING_USER } from '../consts/app-global';
import { getInitializeData } from '../lib/initialize/konstructor-init/konstructor-init.util';

export const initial =
    (): AppThunk =>
        async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {
            const state = getState();
            const app = state.app;
            const isLoading = app.isLoading;

            if (!isLoading) {
                const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
                const { domain } = bitrix.api.getInitializedData();

                dispatch(appActions.loading({ status: true }));
                startStoreListeners(listenerMiddleware);


                //оснолвные данные для работы конструктора - кешируются в localStorage
                await getInitializeData(dispatch, domain);

                //init второстепенные сущности, которые можно сделать в listeners
                dispatch(fetchBaseTemplate({ domain }));
                dispatch(fetchOfferTemplates())

                //bitrix entities init
                appInit(dispatch, () => {
                    dispatch(appActions.loading({ status: false }));
                });
            }
        };

export const reloadApp =
    (): AppThunk =>
        async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {
            const state = getState();
            const app = state.app;
            console.log('reload App');
            console.log(app);
            // const isReloading = app.isReloading;

            // if (!isReloading) {
            //     dispatch(appActions.reloading({ status: true }));
            //     appInit(dispatch, getState, getWSClient, () => {
            //         dispatch(appActions.reloading({ status: false }));
            //     });
            // }
        };
