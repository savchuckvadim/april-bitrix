import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { AppDispatch, getWSClient, RootState, ThunkExtraArgument } from '@/modules/app/model/store';
import { userReportActions } from '../slice/UserReportSlice';
import { IUserReportItem } from '../../type/user-report.type';

import { WSClient } from '@workspace/ws';
import { appActions } from '@/modules/app';

// export const listener = createListenerMiddleware<RootState, AppDispatch, ThunkExtraArgument>();
export enum USER_REPORT_EVENT {
    PROGRESS = 'sales-user-report:progress',
    DONE = 'sales-user-report:done',
}
const waitForConnection = async (wsClient: WSClient) =>
    new Promise<void>(resolve => {
        if (wsClient.socket.connected) {

            resolve();
        } else {
            wsClient.socket.once('connect', () => {

                resolve();
            });
        }
    });

export const startUserReportAppListener = (
    listener: ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>,
    // wsClient: WSClient
) => {
    debugger;
    listener.startListening({
        matcher: isAnyOf(
            appActions.setAppData,


        ),

        effect: async (action, { extra, dispatch, getState, }) => {
            const wsClient = getWSClient()
            startWsEventsListener(dispatch, wsClient);


            debugger

        },
    });

}


export const startWsEventsListener = async (dispatch: AppDispatch, wsClient: WSClient) => {


    debugger;

    await waitForConnection(wsClient);

    wsClient.on(USER_REPORT_EVENT.PROGRESS, (payload: IUserReportItem[]) => {
        debugger

        payload
            && payload.length > 0
            && dispatch(userReportActions.setProgressFetchedReport(payload));
    });
    wsClient.on(USER_REPORT_EVENT.DONE, (payload: IUserReportItem[]) => {
        debugger
        dispatch(userReportActions.setFullFetchedReport(true));
    });

    debugger
}
