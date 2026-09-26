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

/** WS-события тяжёлых ручек AI-аналитики (зеркало констант бэка). */
export const AI_WS_EVENTS = {
    OVERVIEW_DONE: 'ai-analytics:overview:done',
    OVERVIEW_ERROR: 'ai-analytics:overview:error',
    BRIEF_DONE: 'ai-analytics:brief:done',
    BRIEF_ERROR: 'ai-analytics:brief:error',
    DOSSIER_DONE: 'ai-analytics:dossier:done',
    DOSSIER_ERROR: 'ai-analytics:dossier:error',
} as const;

/** Пары done/error: обработка одна на все очереди — различаются ключом. */
const AI_WS_QUEUES = [
    { done: AI_WS_EVENTS.OVERVIEW_DONE, error: AI_WS_EVENTS.OVERVIEW_ERROR },
    { done: AI_WS_EVENTS.BRIEF_DONE, error: AI_WS_EVENTS.BRIEF_ERROR },
    { done: AI_WS_EVENTS.DOSSIER_DONE, error: AI_WS_EVENTS.DOSSIER_ERROR },
] as const;

/** Полезная нагрузка done: ключ результата и момент расчёта. */
export interface AiQueueDonePayload {
    requestKey?: string;
    generatedAt?: string;
}

/** Полезная нагрузка error: ключ и текст ошибки. */
export interface AiQueueErrorPayload {
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
 * Очереди (обзор, резюме) отвечают по WS только фактом готовности — сами
 * данные по сокету НЕ приходят. На done thunk повторяет тот же POST у
 * секций, что ждали этот ключ (обзор, «Внимание», срез по типу — ключ
 * обзора; резюме — свой ключ по packHash), и получает ready из кэша в
 * своём периметре; на error — секции с этим ключом уходят в ошибку.
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

            for (const queue of AI_WS_QUEUES) {
                wsClient.on(
                    queue.done,
                    (payload: AiQueueDonePayload | undefined) => {
                        dispatch(resumeAiQueuedSections(payload?.requestKey));
                    },
                );
                wsClient.on(
                    queue.error,
                    (payload: AiQueueErrorPayload | undefined) => {
                        dispatch(failAiQueuedSections(payload ?? {}));
                    },
                );
            }
        },
    });
};
