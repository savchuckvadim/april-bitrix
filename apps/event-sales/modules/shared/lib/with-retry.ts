import { getResponseStatus, isSlowServerError } from './request-error';

/** Сколько раз повторяем запрос, прежде чем признать его неудачным. */
export const RETRY_ATTEMPTS = 3;
/** База экспоненциальной паузы: 400мс → 800мс. */
export const RETRY_BASE_DELAY_MS = 400;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Сервер перезапускается или временно недоступен — повтор уместен. */
const RETRYABLE_STATUSES: ReadonlySet<number> = new Set([429, 502, 503]);

/**
 * Повторяемая ли ошибка.
 *
 * Повторяем только БЫСТРЫЕ сбои, которые лечатся повтором: сеть моргнула
 * (ответа нет вовсе) или сервер перезапускается (502/503).
 *
 * НЕ повторяем:
 *  - 4xx — неверный домен или несуществующая сущность от повтора не
 *    исправятся;
 *  - таймаут и 504 — запрос провисел до предела, потому что сервер занят;
 *    повтор ×3 утраивал нагрузку ровно в момент перегруза (разбор
 *    05.10.2026: до шести цепочек одного запроса вместо одной);
 *  - 500 — ошибка самого обработчика, повтор даст её же.
 */
export const isRetryable = (error: unknown): boolean => {
    if (isSlowServerError(error)) return false;
    const status = getResponseStatus(error);
    if (status === undefined) return true;
    return RETRYABLE_STATUSES.has(status);
};

/**
 * Повтор с нарастающей паузой.
 *
 * Живёт в api-хелперах, а не в компонентах: разовый сетевой сбой не должен
 * показывать менеджеру ошибку там, где достаточно повторить.
 */
export const withRetry = async <T>(request: () => Promise<T>): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
        try {
            return await request();
        } catch (error) {
            lastError = error;
            if (!isRetryable(error)) break;
            if (attempt < RETRY_ATTEMPTS - 1) {
                await wait(RETRY_BASE_DELAY_MS * 2 ** attempt);
            }
        }
    }

    throw lastError;
};
