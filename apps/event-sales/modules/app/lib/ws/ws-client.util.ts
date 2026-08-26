import type { WSClient } from '@workspace/ws';
import { getWSClient, initWSClient } from '../../model/store';

/**
 * Безопасный доступ к WS-клиенту приложения.
 *
 * Клиент создаётся лениво, первым же потребителем: постоянное соединение не
 * нужно каждой встройке (компактные вкладки живут без WS), а `getWSClient`
 * стора бросает исключение до инициализации. Здесь оба случая сведены к
 * честным null/undefined — потребители (подписка ЗПР, socketId в flow) сами
 * решают, что делать без сокета.
 */
export const ensureWSClient = (
    userId: number,
    domain: string,
): WSClient | null => {
    try {
        return getWSClient();
    } catch {
        try {
            return initWSClient(userId, domain);
        } catch (error) {
            console.warn('ws client init failed', error);
            return null;
        }
    }
};

/**
 * socketId текущего соединения для flow-запросов: по нему бэк шлёт
 * `*-flow:done` точечно в наш фрейм. Сокет не создан или ещё не подключился —
 * undefined, и бэк просто не шлёт push (поллинг остаётся основным каналом).
 */
export const getSocketIdSafe = (): string | undefined => {
    try {
        return getWSClient().id;
    } catch {
        return undefined;
    }
};
