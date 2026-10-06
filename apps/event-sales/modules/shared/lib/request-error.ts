/**
 * Что случилось с запросом к нашему серверу — для повторов и для текста
 * ошибки на экране.
 */

/** Коды axios: запрос не уложился в отведённое время. */
const TIMEOUT_CODES: ReadonlySet<string> = new Set([
    'ECONNABORTED',
    'ETIMEDOUT',
]);

/** HTTP 504: шлюз не дождался ответа сервера — тот же перегруз. */
const GATEWAY_TIMEOUT_STATUS = 504;

interface RequestErrorLike {
    code?: unknown;
    response?: { status?: unknown };
}

const asRequestError = (error: unknown): RequestErrorLike =>
    error && typeof error === 'object' ? (error as RequestErrorLike) : {};

/** HTTP-статус ответа; undefined — ответа не было вовсе (сеть, таймаут). */
export const getResponseStatus = (error: unknown): number | undefined => {
    const status = asRequestError(error).response?.status;
    return typeof status === 'number' ? status : undefined;
};

/**
 * Сервер не успел ответить: наш таймаут или 504 от шлюза. Повторять такой
 * запрос сразу нельзя — он провисел десятки секунд именно потому, что
 * сервер занят, и повтор только добавил бы ему работы.
 */
export const isSlowServerError = (error: unknown): boolean => {
    const { code } = asRequestError(error);
    if (typeof code === 'string' && TIMEOUT_CODES.has(code)) return true;
    return getResponseStatus(error) === GATEWAY_TIMEOUT_STATUS;
};

/** Текст для менеджера, когда сервер не успел ответить. */
export const SLOW_SERVER_TEXT =
    'Сервер долго не отвечает. Попробуйте ещё раз чуть позже.';
