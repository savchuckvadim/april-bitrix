import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AirtimeProgressDto } from '@workspace/nest-kpi-report-sales-api';
import { WSClient } from '@workspace/ws';
import { appActions } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import { airtimeActions } from '../airtime-slice';
import { pollTeamAirtimeNow, pollUserAirtimeNow } from '../airtime-thunks';

/** WS-события эфирного времени (зеркало AIRTIME_WS_EVENTS бэка). */
export const AIRTIME_WS_EVENTS = {
    PROGRESS: 'airtime:progress',
    DONE: 'airtime:done',
    ERROR: 'airtime:error',
} as const;

interface AirtimeProgressPayload extends AirtimeProgressDto {
    requestKey: string;
    month: string;
}

interface AirtimeDonePayload {
    requestKey: string;
}

interface AirtimeErrorPayload {
    requestKey: string;
    month: string;
    message: string;
}

const waitForConnection = async (wsClient: WSClient) =>
    new Promise<void>(resolve => {
        if (wsClient.socket.connected) resolve();
        else wsClient.socket.once('connect', () => resolve());
    });

/** Повторный setAppData (реинициализация домена) не должен плодить хендлеры. */
let handlersWired = false;

/**
 * События сборки партиций эфирного времени. Доставка ускоряет UI
 * (прогресс/готовность мгновенно), но НЕ обязательна: поллинг thunks —
 * самодостаточный канал (WS может не подняться за прокси).
 * Матчинг секции — по requestKey (отсев устаревших внутри редьюсеров).
 */
export const startAirtimeWsListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch, getState }) => {
            if (handlersWired) return;
            const wsClient = getWSClient();
            await waitForConnection(wsClient);
            handlersWired = true;

            const matchSection = (requestKey: string) => {
                const { team, user } = getState().airtime;
                return {
                    isTeam: team.requestKey === requestKey,
                    isUser: user.requestKey === requestKey,
                };
            };

            wsClient.on(
                AIRTIME_WS_EVENTS.PROGRESS,
                (payload: AirtimeProgressPayload) => {
                    if (!payload?.requestKey) return;
                    const { isTeam, isUser } = matchSection(payload.requestKey);
                    const progress = {
                        totalMonths: payload.totalMonths,
                        readyMonths: payload.readyMonths,
                        months: payload.months,
                        etaSeconds: payload.etaSeconds,
                    };
                    if (isTeam) {
                        dispatch(
                            airtimeActions.teamProgress({
                                requestKey: payload.requestKey,
                                progress,
                            }),
                        );
                    }
                    if (isUser) {
                        dispatch(
                            airtimeActions.userProgress({
                                requestKey: payload.requestKey,
                                progress,
                            }),
                        );
                    }
                },
            );

            wsClient.on(
                AIRTIME_WS_EVENTS.DONE,
                (payload: AirtimeDonePayload) => {
                    if (!payload?.requestKey) return;
                    const { isTeam, isUser } = matchSection(payload.requestKey);
                    // Готово: немедленный повторный POST заберёт отчёт из кэша.
                    if (isTeam) dispatch(pollTeamAirtimeNow());
                    if (isUser) dispatch(pollUserAirtimeNow());
                },
            );

            wsClient.on(
                AIRTIME_WS_EVENTS.ERROR,
                (payload: AirtimeErrorPayload) => {
                    if (!payload?.requestKey) return;
                    const { isTeam, isUser } = matchSection(payload.requestKey);
                    const message = payload.month
                        ? `Сбор за ${payload.month} упал: ${payload.message}`
                        : payload.message;
                    if (isTeam) {
                        dispatch(
                            airtimeActions.teamFailed({
                                requestKey: payload.requestKey,
                                message,
                            }),
                        );
                    }
                    if (isUser) {
                        dispatch(
                            airtimeActions.userFailed({
                                requestKey: payload.requestKey,
                                message,
                            }),
                        );
                    }
                },
            );
        },
    });
};
