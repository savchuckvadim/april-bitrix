import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { WSClient } from '@workspace/ws';
import { appActions } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import {
    failAiQueuedSections,
    resumeAiQueuedSections,
} from '../ai-analytics-thunks';

/** WS-события обзора AI-аналитики (зеркало констант бэка). */
export const AI_WS_EVENTS = {
    OVERVIEW_DONE: 'ai-analytics:overview:done',
    OVERVIEW_ERROR: 'ai-analytics:overview:error',
} as const;

/** Полезная нагрузка done: ключ результата и момент расчёта. */
export interface AiOverviewDonePayload {
    requestKey?: string;
    generatedAt?: string;
}

/** Полезная нагрузка error: ключ и текст ошибки. */
export interface AiOverviewErrorPayload {
    requestKey?: string;
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
 * Очередь обзора отвечает по WS только фактом готовности — сам обзор по
 * сокету НЕ приходит. На done thunk повторяет тот же POST у секций, что
 * ждали этот ключ (обзор, «Внимание», срез по типу), и получает ready из
 * кэша в своём периметре; на error — секции уходят в ошибку с текстом.
 */
export const startAiWsListener = (
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
                AI_WS_EVENTS.OVERVIEW_DONE,
                (payload: AiOverviewDonePayload | undefined) => {
                    dispatch(resumeAiQueuedSections(payload?.requestKey));
                },
            );
            wsClient.on(
                AI_WS_EVENTS.OVERVIEW_ERROR,
                (payload: AiOverviewErrorPayload | undefined) => {
                    dispatch(failAiQueuedSections(payload ?? {}));
                },
            );
        },
    });
};
