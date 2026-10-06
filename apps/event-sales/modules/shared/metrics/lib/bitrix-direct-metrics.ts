import {
    type BitrixCallOutcome,
    setBitrixCallObserver,
} from '@workspace/bitrix';
import { countBitrixDirectCalls } from './business-metrics';
import { isMetricsEnabled } from './metrics-client';

/**
 * Прямые вызовы Битрикса из браузера — счётчиком по исходу.
 *
 * Битрикс считает запросы браузеров по внешнему IP офиса: если менеджеры
 * сидят за одним адресом, они делят одно ведро лимита, и с сервера этого не
 * видно (разбор нагрузки 05.10.2026, пункт 2.9). Рост исхода `limit` —
 * прямой признак.
 *
 * Событие на каждый вызов было бы лишним трафиком: вызовы копятся в памяти
 * и уходят суммой раз в {@link FLUSH_INTERVAL_MS}. Потерять при закрытии
 * вкладки можно не больше этого окна — для счётчика это допустимо.
 */
export const FLUSH_INTERVAL_MS = 30_000;

export interface BitrixDirectMetrics {
    /** Учесть один вызов (то же, что зовёт наблюдатель пакета). */
    record: (outcome: BitrixCallOutcome) => void;
    /** Отправить накопленное сейчас. */
    flush: () => void;
}

/**
 * Накопитель без глобалей — его и покрывает тест. `send` получает сумму по
 * каждому исходу с прошлой отправки.
 */
export const createBitrixDirectMetrics = (
    send: (outcome: BitrixCallOutcome, value: number) => void,
    schedule: (flush: () => void) => void = flush => {
        setTimeout(flush, FLUSH_INTERVAL_MS);
    },
): BitrixDirectMetrics => {
    const counts = new Map<BitrixCallOutcome, number>();
    let scheduled = false;

    const flush = (): void => {
        scheduled = false;
        for (const [outcome, value] of counts) {
            if (value > 0) send(outcome, value);
        }
        counts.clear();
    };

    const record = (outcome: BitrixCallOutcome): void => {
        counts.set(outcome, (counts.get(outcome) ?? 0) + 1);
        if (scheduled) return;
        scheduled = true;
        schedule(flush);
    };

    return { record, flush };
};

/**
 * Подписаться на прямые вызовы пакета @workspace/bitrix. Метрики выключены
 * или мы не в браузере — ничего не делаем.
 */
export const startBitrixDirectMetrics = (
    getDomain: () => string | null | undefined,
): void => {
    if (!isMetricsEnabled() || typeof window === 'undefined') return;
    const counter = createBitrixDirectMetrics((outcome, value) =>
        countBitrixDirectCalls({ outcome, value, domain: getDomain() }),
    );
    setBitrixCallObserver(counter.record);
};
