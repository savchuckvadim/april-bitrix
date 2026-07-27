import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { WSClient } from '@workspace/ws';
import { appActions } from '@/modules/app';
import {
    AppDispatch,
    getWSClient,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { reportLinksActions } from '../report-links-slice';

/** Событие живого онлайна ссылок (зеркало бэка presence-room.util). */
export const SHARE_PRESENCE_EVENT = 'share:presence';

/** Имя комнаты владельца (зеркало бэка sharePresenceRoom). */
const sharePresenceRoom = (domain: string, creatorBxUserId: number): string =>
    `share-presence:${domain}:${creatorBxUserId}`;

const waitForConnection = async (wsClient: WSClient) =>
    new Promise<void>(resolve => {
        if (wsClient.socket.connected) resolve();
        else wsClient.socket.once('connect', () => resolve());
    });

let wired = false;

/**
 * Живой онлайн публичных ссылок (зелёная точка) через WS.
 *
 * Владелец во фрейме вступает в СВОЮ комнату (room:join) и слушает
 * `share:presence {token, online}` — бэк пушит туда при heartbeat зрителей.
 * Публичная страница WS НЕ поднимает (у неё HTTP-heartbeat). Событие несёт
 * только счётчик — никаких данных отчёта.
 *
 * Уменьшение (последний зритель ушёл) ловит поллинг списка в диалоге
 * (ленивая чистка ZSET на бэке) — WS даёт мгновенный рост.
 */
export const startSharePresenceListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch, getState }) => {
            if (wired) return;
            const { domain, bitrix } = getState().app;
            const userId = Number(bitrix.user?.ID);
            if (!domain || !userId) return;

            const wsClient = getWSClient();
            await waitForConnection(wsClient);
            wired = true;

            wsClient.emit('room:join', sharePresenceRoom(domain, userId));
            wsClient.on(
                SHARE_PRESENCE_EVENT,
                (payload: { token: string; online: number }) => {
                    if (payload?.token) {
                        dispatch(reportLinksActions.setLinkOnline(payload));
                    }
                },
            );
        },
    });
};
