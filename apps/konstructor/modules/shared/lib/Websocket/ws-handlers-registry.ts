// packages/ws/ws-handlers-registry.ts
import { type AppDispatch } from '@/modules/app/model/store';
import { wsClient, WSClient } from './ws-client';

type WSHandler = (data: unknown, dispatch: AppDispatch) => void;

const handlerMap = new Map<string, WSHandler>();

export function registerWSHandler(event: string, handler: WSHandler) {
    console.log('🔧 Registering WS handler for event:', event);
    handlerMap.set(event, handler);
}

export function initWSHandlers(dispatch: AppDispatch) {
    console.log(
        '🔧 Initializing WS handlers, total handlers:',
        handlerMap.size,
    );
    const ws = WSClient.getClient();

    handlerMap.forEach((handler, event) => {
        console.log('🔧 Setting up handler for event:', event);
        ws.on(event, data => {
            console.log('🔧 Received WS event:', event, 'data:', data);
            handler(data, dispatch);
        });
    });
}
