/**
 * Наблюдатель прямых вызовов Битрикса из браузера.
 *
 * Зачем (разбор нагрузки 05.10.2026): браузеры менеджеров ходят в Битрикс
 * напрямую, и Битрикс считает эти запросы по внешнему IP офиса — если все
 * сидят за одним адресом, они делят одно ведро лимита. С сервера этого не
 * видно. Приложение подписывается сюда и считает вызовы и ошибки лимита.
 *
 * Наблюдатель получает только исход — ни метода, ни данных: метрики не
 * должны знать, что именно спрашивали.
 */
export type BitrixCallOutcome = 'ok' | 'limit' | 'error';

export type BitrixCallObserver = (outcome: BitrixCallOutcome) => void;

let observer: BitrixCallObserver | null = null;

/** Подписаться (null — отписаться). Наблюдатель один на вкладку. */
export const setBitrixCallObserver = (next: BitrixCallObserver | null): void => {
    observer = next;
};

/** Ошибка лимита Битрикса: частота, время работы метода, перегрузка. */
export const isBitrixLimitError = (error: unknown): boolean => {
    const text = (() => {
        if (error instanceof Error) return `${error.name} ${error.message}`;
        try {
            return JSON.stringify(error) ?? '';
        } catch {
            return '';
        }
    })();
    return /QUERY_LIMIT_EXCEEDED|OPERATION_TIME_LIMIT|OVERLOAD_LIMIT/i.test(text);
};

const notify = (outcome: BitrixCallOutcome): void => {
    try {
        observer?.(outcome);
    } catch {
        // Наблюдатель не имеет права уронить вызов Битрикса.
    }
};

/** Выполнить вызов и сообщить наблюдателю исход; результат и ошибка — как есть. */
export const observeBitrixCall = async <T>(call: () => Promise<T>): Promise<T> => {
    try {
        const result = await call();
        notify('ok');
        return result;
    } catch (error) {
        notify(isBitrixLimitError(error) ? 'limit' : 'error');
        throw error;
    }
};
