import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppGetState, AppStartListening } from '@/modules/app/model/store';
import type { QuestionnaireCatalogStatus } from '../model/QuestionnaireCatalogSlice';
import {
    questionnaireCatalogActions,
    questionnaireCatalogReducer,
} from '../model/QuestionnaireCatalogSlice';
import {
    notifyQuestionnaireCatalogSettled,
    startQuestionnaireCatalogSettleListener,
    waitForQuestionnaireCatalog,
} from './questionnaire-wait';

/**
 * Ожидание каталога: ждём только `loading` и только до дедлайна, будит
 * подписка (листенер на fulfilled/failed), а не поллинг.
 *
 * Смысл проверок — не «дождались», а «отпустили»: каталог не имеет права
 * задерживать отправку отчёта дольше полутора секунд, чем бы он ни болел.
 * Плюс новая механика: settled-экшен отпускает ожидающего МГНОВЕННО, а
 * ложный сигнал не отпускает раньше времени.
 */

const stateOf = (status: () => QuestionnaireCatalogStatus): AppGetState =>
    (() => ({ questionnaireCatalog: { status: status() } })) as never;

/** Мини-стор с настоящим редьюсером каталога и настоящим будильником. */
const makeCatalogStore = () => {
    const listener = createListenerMiddleware();
    startQuestionnaireCatalogSettleListener(
        listener.startListening as unknown as AppStartListening,
    );

    return configureStore({
        reducer: { questionnaireCatalog: questionnaireCatalogReducer },
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
};

afterEach(() => {
    // Отпускаем застрявших ожидающих — их резолв не должен доехать в чужой
    // тест (промисы с фейковыми таймерами иначе висят вечно).
    notifyQuestionnaireCatalogSettled();
    vi.useRealTimers();
});

describe('ожидание каталога анкет', () => {
    it('укладывается в дедлайн и отпускает, даже если каталог всё ещё грузится', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        let settledAt = 0;

        const waiting = waitForQuestionnaireCatalog(
            stateOf(() => 'loading'),
        ).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(1000);
        expect(settledAt).toBe(0);

        await vi.advanceTimersByTimeAsync(600);
        await waiting;

        expect(settledAt - started).toBeGreaterThanOrEqual(1500);
        expect(settledAt - started).toBeLessThanOrEqual(1600);
    });

    it('settled-экшен будит сразу, а не на ближайшем шаге поллинга', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        // Момент снимается ВНУТРИ промиса: часы теста уедут дальше сами.
        let settledAt = 0;

        const store = makeCatalogStore();
        store.dispatch(
            questionnaireCatalogActions.pending({ domain: 'gsr.bitrix24.ru' }),
        );

        const waiting = waitForQuestionnaireCatalog(
            store.getState as unknown as AppGetState,
        ).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(200);
        expect(settledAt).toBe(0);

        // Каталог провалился во встроенный набор — состояние settled,
        // листенер отпускает ожидающего в тот же момент.
        store.dispatch(questionnaireCatalogActions.failed());
        await waiting;

        expect(settledAt - started).toBe(200);
    });

    it('ложный сигнал не отпускает: каталог всё ещё грузится — ждём дальше', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        let settledAt = 0;

        const waiting = waitForQuestionnaireCatalog(
            stateOf(() => 'loading'),
        ).then(() => {
            settledAt = Date.now();
        });

        await vi.advanceTimersByTimeAsync(500);
        notifyQuestionnaireCatalogSettled();
        // Микротаски отработали, но состояние не settled — ожидание живо.
        await vi.advanceTimersByTimeAsync(0);
        expect(settledAt).toBe(0);

        // Дедлайн остаётся исходным — потолок не сдвигается сигналом.
        await vi.advanceTimersByTimeAsync(1000);
        await waiting;

        expect(settledAt - started).toBeGreaterThanOrEqual(1500);
        expect(settledAt - started).toBeLessThanOrEqual(1600);
    });

    it('не ждёт вовсе, если запрос не начинали или он уже провалился', async () => {
        vi.useFakeTimers();
        const started = Date.now();

        await waitForQuestionnaireCatalog(stateOf(() => 'idle'));
        await waitForQuestionnaireCatalog(stateOf(() => 'error'));

        // Ни одного тика таймера: fallback-состояние уже settled.
        expect(Date.now() - started).toBe(0);
    });
});
