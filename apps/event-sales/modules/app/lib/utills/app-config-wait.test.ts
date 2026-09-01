import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppGetState, AppStartListening } from '../../model/store';
import { appActions, appReducer } from '../../model/slice/AppSlice';
import {
    notifyAppConfigSettled,
    startAppConfigSettleListener,
    waitForAppConfig,
} from './app-config-wait';

/**
 * Ожидание портальных настроек: ждём только до дедлайна, будит подписка
 * (листенер на setConfigFetched), а не поллинг.
 *
 * Контракт прежний, механика новая: settled-состояние возвращается
 * мгновенно, settled-экшен отпускает сразу, недождавшийся уходит по
 * дедлайну на хардкод (fail-open), и ⟳, погасив флаг, заставляет нового
 * ожидающего ждать СЛЕДУЮЩЕГО завершения fetchAppConfig.
 */

const stateOf = (isConfigFetched: () => boolean): AppGetState =>
    (() => ({ app: { isConfigFetched: isConfigFetched() } })) as never;

/** Мини-стор с настоящим app-редьюсером и настоящим будильником. */
const makeAppStore = () => {
    const listener = createListenerMiddleware();
    startAppConfigSettleListener(
        listener.startListening as unknown as AppStartListening,
    );

    return configureStore({
        reducer: { app: appReducer },
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
};

afterEach(() => {
    // Отпускаем застрявших ожидающих — их резолв не должен доехать в чужой
    // тест (промисы с фейковыми таймерами иначе висят вечно).
    notifyAppConfigSettled();
    vi.useRealTimers();
});

describe('ожидание портальных настроек', () => {
    it('укладывается в дедлайн и отпускает, даже если настройки всё ещё едут', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        let settledAt = 0;

        const waiting = waitForAppConfig(stateOf(() => false)).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(1000);
        expect(settledAt).toBe(0);

        await vi.advanceTimersByTimeAsync(600);
        await waiting;

        expect(settledAt - started).toBeGreaterThanOrEqual(1500);
        expect(settledAt - started).toBeLessThanOrEqual(1600);
    });

    it('настройки уже получены — возврат мгновенный, без единого таймера', async () => {
        vi.useFakeTimers();
        const started = Date.now();

        await waitForAppConfig(stateOf(() => true));

        expect(Date.now() - started).toBe(0);
    });

    it('setConfigFetched будит сразу, а не на ближайшем шаге поллинга', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        // Момент снимается ВНУТРИ промиса: часы теста уедут дальше сами.
        let settledAt = 0;

        const store = makeAppStore();
        const waiting = waitForAppConfig(
            store.getState as unknown as AppGetState,
        ).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(200);
        expect(settledAt).toBe(0);

        // fetchAppConfig завершился (finally): листенер отпускает ожидающего
        // в тот же момент — раньше он спал бы до следующего 50мс-шага.
        store.dispatch(appActions.setConfigFetched());
        await waiting;

        expect(settledAt - started).toBe(200);
    });

    it('ложный сигнал не отпускает: флага нет — ждём дальше до исходного дедлайна', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        let settledAt = 0;

        const waiting = waitForAppConfig(stateOf(() => false)).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(500);
        notifyAppConfigSettled();
        await vi.advanceTimersByTimeAsync(0);
        expect(settledAt).toBe(0);

        await vi.advanceTimersByTimeAsync(1000);
        await waiting;

        expect(settledAt - started).toBeGreaterThanOrEqual(1500);
        expect(settledAt - started).toBeLessThanOrEqual(1600);
    });

    it('⟳ гасит флаг — новый ожидающий ждёт следующего завершения', async () => {
        vi.useFakeTimers();

        const store = makeAppStore();
        store.dispatch(appActions.setConfigFetched());

        // Флаг стоит — ожидание проходит насквозь.
        await waitForAppConfig(store.getState as unknown as AppGetState);

        // ⟳: флаг гаснет, повторный init не должен уйти со старым значением.
        store.dispatch(appActions.reload());
        expect(store.getState().app.isConfigFetched).toBe(false);

        let settledAt = 0;
        const started = Date.now();
        const waiting = waitForAppConfig(
            store.getState as unknown as AppGetState,
        ).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(300);
        expect(settledAt).toBe(0);

        store.dispatch(appActions.setConfigFetched());
        await waiting;

        expect(settledAt - started).toBe(300);
    });
});
