import { WSClient } from '@workspace/ws';

/**
 * Синглтон WS-клиента вынесен из `store.ts` намеренно.
 *
 * `store.ts` при инициализации собирает rootReducer и регистрирует listeners,
 * то есть тянет за собой половину модулей приложения. Если те же модули
 * импортируют из него `getWSClient`, получается цикл: часть графа
 * инициализируется, когда неймспейс стора ещё не заполнен, и на публичной
 * странице /share это падало в `Cannot read properties of undefined`.
 * Отдельный листовой модуль цикл исключает.
 */
let wsClient: WSClient;

/**
 * WS живёт на том же сервере, что и API kpi-report-sales (socket.io
 * gateway внутри приложения) — хост совпадает с базой api-пакета.
 */
const resolveWsHost = () =>
    process.env.NEXT_PUBLIC_KPI_SALES_API_URL || 'http://localhost:3000/';

export const initWSClient = (userId: number, domain: string) => {
    wsClient = new WSClient(userId, domain, resolveWsHost());
    return wsClient;
};

export const getWSClient = () => {
    if (!wsClient) throw new Error('WSClient not initialized');
    return wsClient;
};
