import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { WSClient } from '@workspace/ws';
import { appActions } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import type { DigestReport } from '../index';
import { digestActions } from '../digest-slice';
import { pollDigestNow } from '../digest-thunks';

/** WS-события дайджеста (зеркало KPI_DIGEST_WS_EVENTS бэка). */
export const DIGEST_WS_EVENTS = {
    DONE: 'kpi-report:digest:done',
    ERROR: 'kpi-report:digest:error',
} as const;

interface DonePayload {
    requestKey: string;
    data?: DigestReport;
}

interface ErrorPayload {
    requestKey: string;
    message?: string;
}

const waitForConnection = async (wsClient: WSClient) =>
    new Promise<void>(resolve => {
        if (wsClient.socket.connected) resolve();
        else wsClient.socket.once('connect', () => resolve());
    });

/** Повторный setAppData (реинициализация домена) не должен плодить хендлеры. */
let handlersWired = false;

/**
 * Готовый дайджест из очереди: done несёт данные — применяем сразу, без
 * дополнительного POST; без данных — немедленный повторный POST. Матчинг
 * по requestKey внутри редьюсеров; поллинг остаётся самодостаточным фолбэком.
 */
export const startDigestWsListener = (
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

            wsClient.on(DIGEST_WS_EVENTS.DONE, (payload: DonePayload) => {
                if (!payload?.requestKey) return;
                if (payload.data) {
                    dispatch(
                        digestActions.arrived({
                            requestKey: payload.requestKey,
                            data: payload.data,
                        }),
                    );
                    return;
                }
                dispatch(pollDigestNow());
            });

            wsClient.on(DIGEST_WS_EVENTS.ERROR, (payload: ErrorPayload) => {
                if (!payload?.requestKey) return;
                dispatch(
                    digestActions.failed({
                        requestKey: payload.requestKey,
                        message: payload.message ?? 'Расчёт дайджеста упал',
                    }),
                );
            });
        },
    });
};
