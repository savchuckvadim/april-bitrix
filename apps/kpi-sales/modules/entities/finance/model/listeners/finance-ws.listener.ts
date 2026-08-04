import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { WSClient } from '@workspace/ws';
import { appActions } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import type { FinanceClosedReport, FinanceHotReport } from '../index';
import { financeActions } from '../finance-slice';

/** WS-события финансовой аналитики (зеркало констант бэка). */
export const FINANCE_WS_EVENTS = {
    CLOSED_DONE: 'sales-finance:closed-sales:done',
    CLOSED_ERROR: 'sales-finance:closed-sales:error',
    HOT_DONE: 'sales-finance:hot-clients:done',
    HOT_ERROR: 'sales-finance:hot-clients:error',
} as const;

const waitForConnection = async (wsClient: WSClient) =>
    new Promise<void>(resolve => {
        if (wsClient.socket.connected) resolve();
        else wsClient.socket.once('connect', () => resolve());
    });

/** Повторный setAppData (реинициализация домена) не должен плодить хендлеры. */
let handlersWired = false;

/**
 * Queued-результаты финансовых расчётов приходят по WS (паттерн
 * user-report). closed-sales — одно событие на основной/сравнительный/
 * пользовательский запросы: роутит редьюсер closedSalesArrived по датам.
 */
export const startFinanceWsListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch }) => {
            if (handlersWired) return;
            const wsClient = getWSClient();
            await waitForConnection(wsClient);
            handlersWired = true;

            wsClient.on(
                FINANCE_WS_EVENTS.CLOSED_DONE,
                (payload: FinanceClosedReport) => {
                    if (payload) {
                        dispatch(financeActions.closedSalesArrived(payload));
                    }
                },
            );
            wsClient.on(
                FINANCE_WS_EVENTS.CLOSED_ERROR,
                (payload: { message?: string }) => {
                    dispatch(
                        financeActions.closedFailed(
                            payload?.message ?? 'Ошибка расчёта финансов',
                        ),
                    );
                },
            );
            wsClient.on(
                FINANCE_WS_EVENTS.HOT_DONE,
                (payload: FinanceHotReport) => {
                    if (payload && Array.isArray(payload.deals)) {
                        dispatch(financeActions.hotReady(payload));
                    }
                },
            );
            wsClient.on(
                FINANCE_WS_EVENTS.HOT_ERROR,
                (payload: { message?: string }) => {
                    dispatch(
                        financeActions.hotFailed(
                            payload?.message ??
                                'Ошибка расчёта горячих клиентов',
                        ),
                    );
                },
            );
        },
    });
};
