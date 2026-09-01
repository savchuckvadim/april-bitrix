import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppGetState, AppStartListening } from '@/modules/app/model/store';
import { relatedCrmActions, relatedCrmReducer } from '../model/RelatedCrmSlice';
import type { EntityDescriptor } from './entity-descriptor';
import {
    notifyRelatedDetailsSettled,
    startRelatedCrmSettleListener,
    waitForRelatedDetailsSettled,
} from './related-crm-wait';

/**
 * Ожидание летящего запроса полного графа связей (todo Б5).
 *
 * Контракт как у app-config-wait: не в полёте — возврат мгновенный, будит
 * подписка (настоящий листенер на fetchSucceeded/fetchFailed/reset), ложный
 * сигнал не отпускает, потолок ожидания — страховка от потерянного сигнала.
 */

const descriptor = { entityType: 'COMPANY', entityId: 1 } as EntityDescriptor;
const FULL_KEY = 'COMPANY:1:all';

const stateOf = (
    relatedCrm: () => { status: string; key: string | null },
): AppGetState => (() => ({ relatedCrm: relatedCrm() })) as never;

/** Мини-стор с настоящим редьюсером связей и настоящим будильником. */
const makeStore = () => {
    const listener = createListenerMiddleware();
    startRelatedCrmSettleListener(
        listener.startListening as unknown as AppStartListening,
    );
    return configureStore({
        reducer: { relatedCrm: relatedCrmReducer },
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
};

afterEach(() => {
    // Отпускаем застрявших ожидающих — их резолв не должен доехать в чужой
    // тест (промисы с фейковыми таймерами иначе висят вечно).
    notifyRelatedDetailsSettled();
    vi.useRealTimers();
});

describe('ожидание полного графа связей', () => {
    it('не в полёте (idle / ready / чужой ключ) — возврат мгновенный', async () => {
        vi.useFakeTimers();
        const started = Date.now();

        await waitForRelatedDetailsSettled(
            stateOf(() => ({ status: 'idle', key: null })),
            descriptor,
        );
        await waitForRelatedDetailsSettled(
            stateOf(() => ({ status: 'ready', key: FULL_KEY })),
            descriptor,
        );
        // Летит, но ДРУГОЙ запрос (открытый граф) — ждать его смысла нет.
        await waitForRelatedDetailsSettled(
            stateOf(() => ({ status: 'loading', key: 'COMPANY:1:open' })),
            descriptor,
        );

        expect(Date.now() - started).toBe(0);
    });

    it('fetchSucceeded будит сразу, а не по потолку', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        let settledAt = 0;

        const store = makeStore();
        store.dispatch(
            relatedCrmActions.fetchStarted({
                key: FULL_KEY,
                includeClosed: true,
            }),
        );

        const waiting = waitForRelatedDetailsSettled(
            store.getState as unknown as AppGetState,
            descriptor,
        ).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(200);
        expect(settledAt).toBe(0);

        store.dispatch(
            relatedCrmActions.fetchSucceeded({
                key: FULL_KEY,
                details: { deals: [], leads: [], contacts: [] } as never,
            }),
        );
        await waiting;

        expect(settledAt - started).toBe(200);
        expect(store.getState().relatedCrm.status).toBe('ready');
    });

    it('reset (⟳ во время ожидания) будит и выпускает без данных', async () => {
        vi.useFakeTimers();
        let settled = false;

        const store = makeStore();
        store.dispatch(
            relatedCrmActions.fetchStarted({
                key: FULL_KEY,
                includeClosed: true,
            }),
        );

        const waiting = waitForRelatedDetailsSettled(
            store.getState as unknown as AppGetState,
            descriptor,
        ).then(() => {
            settled = true;
        });

        await vi.advanceTimersByTimeAsync(100);
        expect(settled).toBe(false);

        store.dispatch(relatedCrmActions.reset());
        await waiting;

        expect(settled).toBe(true);
        expect(store.getState().relatedCrm.status).toBe('idle');
    });

    it('ложный сигнал не отпускает: запрос всё ещё летит — ждём до потолка', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        let settledAt = 0;

        const waiting = waitForRelatedDetailsSettled(
            stateOf(() => ({ status: 'loading', key: FULL_KEY })),
            descriptor,
        ).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(5_000);
        notifyRelatedDetailsSettled();
        await vi.advanceTimersByTimeAsync(0);
        expect(settledAt).toBe(0);

        // Потолок 15с — страховка от потерянного сигнала (fail-open:
        // вызывающий перечитает стор и дозапросит сам).
        await vi.advanceTimersByTimeAsync(10_100);
        await waiting;

        expect(settledAt - started).toBeGreaterThanOrEqual(15_000);
        expect(settledAt - started).toBeLessThanOrEqual(15_200);
    });
});
