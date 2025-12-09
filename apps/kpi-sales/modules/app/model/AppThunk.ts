import type { BXUser } from '@workspace/bx';
import { bxAPI as bx } from '@workspace/api';
import { TESTING_DOMAIN, TESTING_USER } from '../consts/app-global';
import { appActions } from './AppSlice';
import { AppDispatch, AppGetState, AppThunk, initWSClient } from './store';
import { WSClient } from '@workspace/ws';
import { socketThunk } from './queue-ws-ping-test/QueueWsPingListener';
import { telegramSendMessage } from '@/modules/shared';
import { startWsEventsListener } from '@/modules/entities';
// import { getBXService } from '../lib/bitrix/get-bx-service';
// import { BitrixService } from '@workspace/bitrix';

export let socket: undefined | WSClient;

export const initial =
    (inBitrix: boolean = true): AppThunk =>
        async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {

            //listeners
            // startUserReportAppListener(listenerMiddleware as ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>);
            // startReportTypeAppListener(listenerMiddleware as ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>)

            const state = getState();
            const app = state.app;
            const isLoading = app.isLoading;
            const __IN_BITRIX__ = inBitrix;

            // const { domain, user:initUser, bitrix } = bxData;
            // const userFromBx = await (bitrix as BitrixService).api.call(
            //     'user.get',
            //     {
            //         ID: initUser.ID,
            //     }
            // )
            // debugger

            // debugger
            if (!isLoading) {
                dispatch(appActions.loading({ status: true }));

                const domain: string = __IN_BITRIX__
                    ? (await bx.getDomain()) || TESTING_DOMAIN
                    : TESTING_DOMAIN;

                const user = __IN_BITRIX__
                    ? ((await bx.getCurrentUser()) as BXUser)
                    : TESTING_USER as BXUser;
                console.log('user');

                console.log(user);

                initWSClient(user.ID, domain); // <- здесь создаёшь сокет
                // const socket = getWSClient()
                dispatch(socketThunk(user.ID, domain));

                dispatch(
                    appActions.setAppData({
                        domain,
                        user,
                    }),
                );


                //for user-report
                const wsClient = getWSClient();
                await startWsEventsListener(dispatch, wsClient);
                dispatch(appActions.loading({ status: false }));
                // dispatch(departmentAPI.endpoints.getDepartment.initiate({ domain }));
            }
        };

export const reloadApp =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        setTimeout(() => {
            dispatch(
                // initialEventApp()
                appActions.reload(),
            );
        }, 1000);
    };

export const sendExpiredStart =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const text = 'Началась задержка загрузки';
        dispatch(sendToTg(text));
    };
export const sendExpiredEnd =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const text = 'Задержка загрузки закончилась';
        dispatch(sendToTg(text));
    };

export const sendDownloadingReport =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const text = 'Скачивание отчета excel';
        dispatch(sendToTg(text));
    };

export const sendToTg =
    (text: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const app = state.app;
        const user = app.bitrix.user;
        const domain = app.domain;
        const userId = user?.ID?.toString() || '';
        let userName = '';
        if (user?.NAME || user?.LAST_NAME) {
            userName = `${user?.NAME || 'name'} ${user?.LAST_NAME || 'last name'}`;
            text += `\n${userName}`;
        }

        await telegramSendMessage({ text, domain, userId });
    };
