import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MetricBatchBody, MetricEvent } from '../model/metric-event.type';
import { METRIC } from '../model/metric-event.type';
import {
    createMetricsClient,
    installMetricsFlushHooks,
} from './metrics-client';

/**
 * Сборщик метрик в браузере. Проверяем ровно то, ради чего он такой скучный:
 * он не бросает НИКОГДА и не растёт БЕСКОНЕЧНО. Всё остальное в нём —
 * следствие этих двух правил.
 */

const REPORT = { name: METRIC.send, labels: { kind: 'report' } } as const;

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
});

const collector = () => {
    const sent: MetricBatchBody[] = [];
    const client = createMetricsClient({ send: body => sent.push(body) });
    return { sent, client };
};

describe('накопление и отправка', () => {
    it('копит в памяти и отдаёт одной пачкой', () => {
        const { sent, client } = collector();
        client.collect(REPORT);
        client.collect(REPORT);
        expect(sent).toHaveLength(0);
        expect(client.size()).toBe(2);

        client.flush();
        expect(sent).toHaveLength(1);
        expect(sent[0]?.events).toHaveLength(2);
        expect(client.size()).toBe(0);
    });

    it('пустой буфер не порождает запрос', () => {
        const { sent, client } = collector();
        client.flush();
        client.flush();
        expect(sent).toHaveLength(0);
    });

    it('уходит само по таймеру — вкладку не обязательно прятать', () => {
        vi.useFakeTimers();
        const sent: MetricBatchBody[] = [];
        const client = createMetricsClient({
            send: body => sent.push(body),
            flushIntervalMs: 1000,
        });
        client.collect(REPORT);
        expect(sent).toHaveLength(0);
        vi.advanceTimersByTime(1000);
        expect(sent).toHaveLength(1);
    });

    it('негодное событие не занимает место в буфере', () => {
        const { client } = collector();
        // Неизвестная метрика и утечка идентификатора — оба отбрасываются
        // ещё на входе, до буфера.
        client.collect({
            name: 'event_sales_nonsense_total',
        } as unknown as MetricEvent);
        client.collect({
            name: METRIC.send,
            labels: { kind: 'report', userId: '17' },
        });
        expect(client.size()).toBe(0);
    });
});

describe('буфер не растёт бесконечно', () => {
    it('за потолком события просто выбрасываются', () => {
        const sent: MetricBatchBody[] = [];
        const client = createMetricsClient({
            send: body => sent.push(body),
            bufferCap: 5,
        });
        for (let i = 0; i < 500; i += 1) client.collect(REPORT);
        expect(client.size()).toBe(5);

        client.flush();
        expect(sent[0]?.events).toHaveLength(5);
    });

    it('упавшая отправка не копит события поверх старых', () => {
        const client = createMetricsClient({
            send: () => {
                throw new Error('маршрут недоступен');
            },
            bufferCap: 10,
        });
        client.collect(REPORT);
        client.flush();
        expect(client.size()).toBe(0);
    });
});

describe('никогда не бросает', () => {
    it('когда транспорт бросает синхронно', () => {
        const client = createMetricsClient({
            send: () => {
                throw new Error('нет сети');
            },
        });
        client.collect(REPORT);
        expect(() => client.flush()).not.toThrow();
    });

    it('когда маршрут отвечает отказом (fetch реджектит)', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.reject(new Error('502'))),
        );
        // Без beacon — чтобы проверить именно запасной путь через fetch.
        vi.stubGlobal('navigator', {});
        const client = createMetricsClient();
        client.collect(REPORT);
        expect(() => client.flush()).not.toThrow();
        // Реджект уходит в .catch внутри клиента: unhandled rejection не будет.
        await Promise.resolve();
    });

    it('когда fetch бросает прямо на вызове', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => {
                throw new Error('заблокировано политикой фрейма');
            }),
        );
        vi.stubGlobal('navigator', {});
        const client = createMetricsClient();
        client.collect(REPORT);
        expect(() => client.flush()).not.toThrow();
    });

    it('когда транспорта нет вовсе (ни beacon, ни fetch)', () => {
        vi.stubGlobal('navigator', undefined);
        vi.stubGlobal('fetch', undefined);
        const client = createMetricsClient();
        expect(() => client.collect(REPORT)).not.toThrow();
        expect(() => client.flush()).not.toThrow();
    });
});

describe('выключатель', () => {
    it('выключенный сбор не копит и не шлёт ничего', () => {
        const sent: MetricBatchBody[] = [];
        const client = createMetricsClient({
            send: body => sent.push(body),
            isEnabled: () => false,
        });
        client.collect(REPORT);
        client.collect(REPORT);
        expect(client.size()).toBe(0);
        client.flush();
        expect(sent).toHaveLength(0);
    });
});

/**
 * Подписка на скрытие вкладки. Зовут её из store.ts безусловно, на импорте
 * модуля, поэтому выключатель обязан проверяться ЗДЕСЬ.
 */
describe('подписка на скрытие вкладки', () => {
    /** Минимальный «браузер»: интересно только, что на нём подписали. */
    const stubDom = (): string[] => {
        const added: string[] = [];
        const bag = {
            addEventListener: (type: string): void => {
                added.push(type);
            },
            removeEventListener: (): void => undefined,
        };
        vi.stubGlobal('document', { ...bag, visibilityState: 'visible' });
        vi.stubGlobal('window', bag);
        return added;
    };

    const quietClient = () =>
        createMetricsClient({ send: () => undefined, isEnabled: () => true });

    it('во вкладке подписывается на visibilitychange и pagehide', () => {
        const added = stubDom();

        installMetricsFlushHooks(quietClient());

        expect(added).toEqual(['visibilitychange', 'pagehide']);
    });

    /**
     * РЕГРЕССИЯ (m1 из разбора): выключатель гасил `collect`, но не подписку —
     * при выключенных метриках слушатели всё равно висели на каждом показе и
     * скрытии вкладки. «Выключено» обязано означать буквально ничего.
     */
    it('выключенный сбор не вешает слушателей вовсе', () => {
        vi.stubEnv('NEXT_PUBLIC_METRICS_DISABLED', '1');
        const added = stubDom();

        const off = installMetricsFlushHooks(quietClient());

        expect(added).toEqual([]);
        expect(off).not.toThrow();
    });
});
