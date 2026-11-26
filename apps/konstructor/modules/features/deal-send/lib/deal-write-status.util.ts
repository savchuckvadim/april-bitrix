/** Ответ ручки статуса записи: нужные поля `GET konstructor/deal-send/status/:operationId`. */
export interface DealWriteStatus {
    /** waiting | active | retrying | completed | failed | not_found */
    state: string;
    /** Ждать больше нечего: записано или упало */
    done: boolean;
    /** Записано */
    ok: boolean;
    /** Последняя ошибка, если не записано */
    error: string | null;
}

/** Чем кончилось ожидание записи полей и товарных строк. */
export type DealWriteOutcome =
    | { kind: 'written' }
    | { kind: 'failed'; reason: string | null }
    /** За отведённое время запись не завершилась: задание идёт, итога пока нет */
    | { kind: 'pending' }
    /** Статус узнать не вышло: задания нет или ручка не отвечает */
    | { kind: 'unknown' };

export interface DealWritePollOptions {
    /** Пауза перед каждым опросом */
    intervalMs: number;
    /** Сколько раз спросить, прежде чем сдаться */
    maxAttempts: number;
    wait: (ms: number) => Promise<void>;
}

/** Бэк повторяет упавшую запись трижды с паузами 2 и 4 с: ждём с запасом. */
export const DEAL_WRITE_POLL: DealWritePollOptions = {
    intervalMs: 1000,
    maxAttempts: 25,
    wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
};

/**
 * Ждёт, пока задание записи сделки закончится. Сбой самого опроса (сеть, 5xx)
 * не считается ответом: задание живёт своей жизнью, спрашиваем снова.
 */
export const waitForDealWrite = async (
    operationId: string,
    fetchStatus: (operationId: string) => Promise<DealWriteStatus>,
    options: DealWritePollOptions = DEAL_WRITE_POLL,
): Promise<DealWriteOutcome> => {
    let answered = false;
    for (let attempt = 0; attempt < options.maxAttempts; attempt += 1) {
        await options.wait(options.intervalMs);
        try {
            const status = await fetchStatus(operationId);
            answered = true;
            if (status.state === 'not_found') return { kind: 'unknown' };
            if (status.done) {
                return status.ok
                    ? { kind: 'written' }
                    : { kind: 'failed', reason: status.error };
            }
        } catch {
            // следующий опрос
        }
    }
    return answered ? { kind: 'pending' } : { kind: 'unknown' };
};
