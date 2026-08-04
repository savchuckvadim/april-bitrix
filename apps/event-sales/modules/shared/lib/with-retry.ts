/** Сколько раз повторяем запрос, прежде чем признать его неудачным. */
export const RETRY_ATTEMPTS = 3;
/** База экспоненциальной паузы: 400мс → 800мс. */
export const RETRY_BASE_DELAY_MS = 400;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Повторяемая ли ошибка. 4xx не повторяем: неверный домен или несуществующая
 * сущность от повторения не исправятся. Нет ответа вовсе — сеть или таймаут,
 * это как раз тот случай, ради которого ретрай и нужен.
 */
const isRetryable = (error: unknown): boolean => {
    const status = (error as { response?: { status?: number } })?.response
        ?.status;
    if (status === undefined) return true;
    return status >= 500 || status === 429;
};

/**
 * Повтор с нарастающей паузой.
 *
 * Живёт в api-хелперах, а не в компонентах: запросы к порталу стартуют сами
 * при открытии фрейма, и разовый сетевой сбой не должен показывать менеджеру
 * ошибку там, где достаточно повторить.
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
