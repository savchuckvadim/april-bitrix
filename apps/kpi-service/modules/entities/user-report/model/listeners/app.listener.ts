import { createListenerMiddleware, isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';

import { appActions } from '@/modules/app';
import { AppDispatch, getWSClient, RootState, ThunkExtraArgument } from '@/modules/app/model/store';
import { userReportActions } from '../slice/UserReportSlice';
import { IUserReportItem } from '../../type/user-report.type';
import { reportActions } from '@/modules/entities/report';
import { departmentActions } from '@/modules/entities/departament';
import { WSClient } from '@workspace/ws';

// export const listener = createListenerMiddleware<RootState, AppDispatch, ThunkExtraArgument>();
export enum USER_REPORT_EVENT {
    PROGRESS = 'ork-user-report:progress',
    DONE = 'ork-user-report:done',
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

    listener.startListening({
        matcher: isAnyOf(
            appActions.setAppData,

        ),

        effect: async (action, { extra, dispatch, getState, }) => {
            const wsClient = getWSClient()

            // const wsClient = extra.getWSClient();



            await waitForConnection(wsClient);

            wsClient.on(USER_REPORT_EVENT.PROGRESS, (payload: IUserReportItem[]) => {

                payload
                    && payload.length > 0
                    && dispatch(userReportActions.setProgressFetchedReport(payload));
            });
            wsClient.on(USER_REPORT_EVENT.DONE, (payload: IUserReportItem[]) => {

                dispatch(userReportActions.setFullFetchedReport(true));
            });



        },
    });

}
