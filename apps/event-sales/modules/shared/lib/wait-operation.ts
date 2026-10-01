/** Статусы операции sales-хука, после которых ждать нечего. */
const FINAL_OPERATION_STATUSES = new Set<string>(['done', 'failed']);

export interface WaitOperationOptions {
    /** Пауза между опросами, мс. */
    readonly intervalMs: number;
    /** Сколько раз спросить, прежде чем сдаться. */
    readonly attempts: number;
    /** Текст ошибки, если операция так и не завершилась. */
    readonly timeoutMessage: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Опрос операции sales-хука до финального статуса (done/failed).
 *
 * Фрейм без WS-подписки, поэтому спрашиваем сами. Первый запрос — сразу:
 * короткая операция к этому моменту уже done. Сам запрос статуса передаёт
 * api-хелпер — эта утилита про api-пакет не знает (DAL только в хелперах).
 */
export const waitForOperation = async <T extends { status?: unknown }>(
    poll: () => Promise<T>,
    options: WaitOperationOptions,
): Promise<T> => {
    for (let attempt = 0; attempt < options.attempts; attempt += 1) {
        if (attempt > 0) await sleep(options.intervalMs);
        const current = await poll();
        if (FINAL_OPERATION_STATUSES.has(String(current.status))) {
            return current;
        }
    }
    throw new Error(options.timeoutMessage);
};
