import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
} from '@reduxjs/toolkit';

import { appActions } from '@/modules/app/model/slice/AppSlice';
import type { AppDispatch, AppStartListening } from '@/modules/app/model/store';
import {
    FLOW_OUTBOX_STATE,
    FLOW_STAGE,
    flowStatusActions,
    flowStatusReducer,
} from '@/modules/processes/event/model/FlowStatusSlice';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
} from '../lib/outbox-envelope';
import { readOutboxEnvelope, writeOutboxEnvelope } from '../lib/outbox-store';
import {
    TEST_DOMAIN,
    makeClock,
    makeEnvelope,
    makeTarget,
    mountDefaultKvWindow,
    mountKvWindow,
} from '../lib/outbox-test-kit';
import { outboxReducer } from './OutboxSlice';
import { enqueueAndDeliver } from './OutboxThunk';
import {
    OUTBOX_DRAIN_INTERVAL_MS,
    stopOutboxDrainTimer,
} from './OutboxDrainThunk';
import {
    resetOutboxOnlineDrainForTests,
    startOutboxDrainListener,
} from './OutboxDrainListener';

/**
 * Поводы дренажа: конец инициализации (setInitializedSuccess, fire-and-forget),
 * `window 'online'` и взвод таймера по появлению недоставленных
 * (setUndelivered); подписка на 'online' не дублируется на reload ⟳.
 * Дренаж здесь настоящий (реестр целей → FlowHelper), мокается только HTTP.
 */

const { sendFlowMock } = vi.hoisted(() => ({ sendFlowMock: vi.fn() }));

vi.mock('@/modules/processes/event/lib/api/flow-helper', () => ({
    FlowHelper: class {
        sendFlow = (dto: unknown) => sendFlowMock(dto);
        getFlowStatus = vi.fn();
    },
}));

/**
 * Прямой исполнитель (А4) в тестах листенера — управляемый фейк: сценарии
 * дренажа задают его исход через directOutcomeMock; по умолчанию допуск
 * «отказано» (unavailable у цели), чтобы прочие сценарии его не замечали.
 */
const { directOutcomeMock } = vi.hoisted(() => ({
    directOutcomeMock: vi.fn(),
}));

vi.mock('./DirectDeliveryThunk', () => ({
    deliverEnvelopeDirect: (envelope: unknown) => async () =>
        directOutcomeMock(envelope),
}));

/** Мини-стор: настоящий листенер-middleware + настоящий редьюсер outbox. */
const makeStore = () => {
    const listener = createListenerMiddleware();

    startOutboxDrainListener(
        listener.startListening as unknown as AppStartListening,
    );

    return configureStore({
        reducer: combineReducers({
            app: (state: { domain: string } = { domain: TEST_DOMAIN }) => state,
            outbox: outboxReducer,
            // настоящий flowStatus: терминальные швы дренажа синхронизируют
            // им финиш текущей отправки
            flowStatus: flowStatusReducer,
        }),
        middleware: getDefault =>
            getDefault({
                serializableCheck: false,
                immutableCheck: false,
            }).prepend(listener.middleware),
    });
};

/** Фейковое окно списка listener'ов: журналим подписку на 'online'. */
const mountWindowWithOnline = () => {
    mountDefaultKvWindow();
    const handlers: Array<() => void> = [];
    const addEventListener = vi.fn((event: string, handler: () => void) => {
        if (event === 'online') {
            handlers.push(handler);
        }
    });

    (
        globalThis as unknown as { window: Record<string, unknown> }
    ).window.addEventListener = addEventListener;

    return { handlers, addEventListener };
};

/**
 * Ожидание С ЗАПАСОМ вместо дефолтной секунды `vi.waitFor`.
 *
 * Дренаж здесь ходит через НАСТОЯЩУЮ цепочку kv-storage поверх фейкового
 * IndexedDB, а её транзакции коммитятся через `setTimeout(0)`: на загруженной
 * машине (полный прогон в несколько воркеров) секунды не хватало, и файл
 * изредка падал по таймауту, будучи изолированно зелёным. Это была ложная
 * тревога, а не сигнал: запас времени её убирает, а настоящий регресс всё
 * равно не дождётся условия и упадёт — просто позже.
 */
const waitFor = <T>(
    check: () => T | Promise<T>,
    options: { timeout?: number; interval?: number } = {},
): Promise<T> => vi.waitFor(check, { timeout: 15_000, ...options });

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    resetOutboxOnlineDrainForTests();
    sendFlowMock.mockReset();
    sendFlowMock.mockImplementation(async (dto: { operationId: string }) => ({
        operationId: dto.operationId,
        status: 'done',
    }));
    directOutcomeMock.mockReset();
    directOutcomeMock.mockResolvedValue({
        status: 'refused',
        reason: 'backend-alive',
    });
});

afterEach(() => {
    stopOutboxDrainTimer();
    // страховка от протечки фейковых таймеров упавшего теста на соседей
    vi.useRealTimers();
    vi.restoreAllMocks();
    mountKvWindow(null);
});

describe('поводы дренажа outbox', { timeout: 20_000 }, () => {
    it('setInitializedSuccess: недоставленный конверт досылается fire-and-forget', async () => {
        mountWindowWithOnline();

        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const store = makeStore();

        store.dispatch(appActions.setInitializedSuccess({}));

        await waitFor(async () => {
            const stored = await readOutboxEnvelope(
                TEST_DOMAIN,
                envelope.operationId,
            );

            expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        });
        expect(sendFlowMock).toHaveBeenCalledTimes(1);
        // зеркало пересчитано — бейджу недоставленных показывать нечего
        expect(store.getState().outbox.undeliveredCount).toBe(0);
    });

    it("window 'online': появление сети запускает дренаж", async () => {
        const { handlers } = mountWindowWithOnline();
        const store = makeStore();

        // init без конвертов — только регистрирует подписку; дожидаемся
        // КОНЦА init-дренажа (он пересчитывает зеркало), иначе повторный
        // запуск упрётся в guard «прогон уже идёт».
        store.dispatch(appActions.setInitializedSuccess({}));
        await waitFor(() => expect(handlers).toHaveLength(1));
        await waitFor(() =>
            expect(store.getState().outbox.countedDomain).toBe(TEST_DOMAIN),
        );

        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        handlers[0]!();

        await waitFor(async () => {
            const stored = await readOutboxEnvelope(
                TEST_DOMAIN,
                envelope.operationId,
            );

            expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        });
    });

    it('бэк лёг при живой сети: exhausted-конверт взводит таймер, и дренаж досылает его без online', async () => {
        mountWindowWithOnline();

        const store = makeStore();

        // Чистый бут: init-дренаж прошёл по пустому домену, таймер не взвёл.
        store.dispatch(appActions.setInitializedSuccess({}));
        await waitFor(() =>
            expect(store.getState().outbox.countedDomain).toBe(TEST_DOMAIN),
        );

        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
            // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
            // (durability-семантика kv-storage): без автопродвижения времени
            // awaited-записи конвертов зависли бы под фейковыми таймерами
            shouldAdvanceTime: true,
        });

        // Отправка при живой сети и лежачем бэке: каждая попытка —
        // network-error, сессионный бэкофф исчерпан, конверт в хранилище.
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();
        const summary = await (store.dispatch as unknown as AppDispatch)(
            enqueueAndDeliver(envelope, {
                deps: {
                    targets: [
                        makeTarget([
                            { outcome: OUTBOX_DELIVERY_OUTCOME.networkError },
                        ]),
                    ],
                    now,
                    wait,
                    tabId: 'tab-x',
                    locks: null,
                },
            }),
        );

        expect(summary.status).toBe('exhausted');
        // Появление недоставленных взвело таймер: события 'online' не будет
        // (сеть жива, лёг бэк), ждать перезапуска фрейма конверту нельзя.
        // Сначала дожимаем 0мс-коммиты фейкового IndexedDB — в счётчике
        // должен остаться только таймер дренажа.
        await vi.advanceTimersByTimeAsync(0);
        expect(vi.getTimerCount()).toBe(1);

        // Через 60с бэк уже ожил (sendFlowMock отвечает done) — дренаж
        // досылает конверт сам, без участия менеджера. Исход ждём ещё под
        // фейковыми таймерами: useRealTimers до конца прогона оборвал бы
        // awaited-коммит записи конверта.
        await vi.advanceTimersByTimeAsync(OUTBOX_DRAIN_INTERVAL_MS);

        await waitFor(async () => {
            const stored = await readOutboxEnvelope(
                TEST_DOMAIN,
                envelope.operationId,
            );

            expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        });
        vi.useRealTimers();
        expect(store.getState().outbox.undeliveredCount).toBe(0);
    });

    it('reload ⟳ (повторный init) не плодит вторую подписку на online', async () => {
        const { addEventListener } = mountWindowWithOnline();
        const store = makeStore();

        store.dispatch(appActions.setInitializedSuccess({}));
        store.dispatch(appActions.setInitializedSuccess({}));

        await waitFor(() => expect(addEventListener).toHaveBeenCalledTimes(1));
        // и после паузы второй подписки так и не появилось
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(addEventListener).toHaveBeenCalledTimes(1);
    });

    it('терминально-отвергнутый бэклог: конверт лежит, но бейдж молчит', async () => {
        mountWindowWithOnline();

        // свежий rejected: TTL не пришёл, запись остаётся следом — но
        // «ждущей отправки» она не считается, и таймер по ней не крутится
        const rejected = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
            updatedAt: Date.now(),
        });

        await writeOutboxEnvelope(rejected);

        const store = makeStore();

        store.dispatch(appActions.setInitializedSuccess({}));

        await waitFor(() =>
            expect(store.getState().outbox.countedDomain).toBe(TEST_DOMAIN),
        );
        expect(store.getState().outbox.undeliveredCount).toBe(0);
        expect(sendFlowMock).not.toHaveBeenCalled();
        await expect(
            readOutboxEnvelope(TEST_DOMAIN, rejected.operationId),
        ).resolves.toMatchObject({ state: OUTBOX_ENVELOPE_STATE.failed });
    });
});

describe(
    'терминальный исход дренажа × flowStatus текущей отправки',
    { timeout: 20_000 },
    () => {
        /** Конверт текущей отправки после исчерпанного бэкоффа (финиш QUEUED). */
        const queuedEnvelope = () =>
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.failed,
                attempts: [
                    {
                        targetId: 'primary-backend',
                        at: 1_000,
                        outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    },
                ],
                nextAttemptAt: 1,
            });

        const sitOnQueuedFinish = (
            store: ReturnType<typeof makeStore>,
            operationId: string,
        ) => {
            store.dispatch(
                flowStatusActions.setSending({
                    startedAt: 1,
                    result: '',
                    operationId,
                }),
            );
            store.dispatch(flowStatusActions.setOutboxQueued());
        };

        it('дренаж дослал текущую операцию: setDone гасит «отправим автоматически»', async () => {
            mountWindowWithOnline();

            const envelope = queuedEnvelope();

            await writeOutboxEnvelope(envelope);

            const store = makeStore();

            sitOnQueuedFinish(store, envelope.operationId);
            store.dispatch(appActions.setInitializedSuccess({}));

            await waitFor(() =>
                expect(store.getState().flowStatus.stage).toBe(FLOW_STAGE.DONE),
            );
            // QUEUED погашен, список помечен устаревшим (kind report) — но
            // никакого cleanEvent/reloadApp из дренажа не происходит
            expect(store.getState().flowStatus.outboxState).toBe(
                FLOW_OUTBOX_STATE.NONE,
            );
            expect(store.getState().flowStatus.isTasksStale).toBe(true);
            await expect(
                readOutboxEnvelope(TEST_DOMAIN, envelope.operationId),
            ).resolves.toMatchObject({
                state: OUTBOX_ENVELOPE_STATE.delivered,
            });
        });

        it('бэкенд отверг текущую операцию: setError с деталью — финиш покажет «Повторить»', async () => {
            mountWindowWithOnline();
            sendFlowMock.mockImplementation(async () => ({
                operationId: 'op',
                status: 'failed',
                error: 'нет стадии сделки',
            }));

            const envelope = queuedEnvelope();

            await writeOutboxEnvelope(envelope);

            const store = makeStore();

            sitOnQueuedFinish(store, envelope.operationId);
            store.dispatch(appActions.setInitializedSuccess({}));

            await waitFor(() =>
                expect(store.getState().flowStatus.stage).toBe(
                    FLOW_STAGE.ERROR,
                ),
            );
            expect(store.getState().flowStatus.error).toBe('нет стадии сделки');
        });

        it('конверт чужой сессии: flowStatus не трогается', async () => {
            mountWindowWithOnline();

            const envelope = queuedEnvelope();

            await writeOutboxEnvelope(envelope);

            const store = makeStore();

            // финиш ждёт ДРУГУЮ операцию — дренаж доставил чей-то ещё конверт
            sitOnQueuedFinish(store, 'op-другой-сессии');
            store.dispatch(appActions.setInitializedSuccess({}));

            await waitFor(async () => {
                await expect(
                    readOutboxEnvelope(TEST_DOMAIN, envelope.operationId),
                ).resolves.toMatchObject({
                    state: OUTBOX_ENVELOPE_STATE.delivered,
                });
            });
            expect(store.getState().flowStatus.stage).toBe(FLOW_STAGE.SENDING);
            expect(store.getState().flowStatus.outboxState).toBe(
                FLOW_OUTBOX_STATE.QUEUED,
            );
        });
    },
);

describe(
    'прямое исполнение из дренажа × flowStatus (А4)',
    { timeout: 20_000 },
    () => {
        it(
            'дренаж исполнил ТЕКУЩУЮ операцию напрямую: DONE + PARTIAL + цель, без reload',
            { timeout: 15_000 },
            async () => {
                mountWindowWithOnline();

                // Бэк лежит: POST падает сетью все три попытки сессии.
                sendFlowMock.mockRejectedValue(
                    Object.assign(new Error('backend down'), {
                        isAxiosError: true,
                    }),
                );
                // Прямой исполнитель (мок thunk'а) исполняет ядро с хвостом.
                directOutcomeMock.mockResolvedValue({
                    status: 'executed',
                    executedDirect: true,
                    deferred: [{ kind: 'kpi' }],
                    addedTaskId: null,
                    portalSnapshotAt: 42_000,
                });

                const envelope = makeEnvelope();

                await writeOutboxEnvelope(envelope);

                const store = makeStore();

                // Менеджер сидит на финише ЭТОЙ отправки («сохранено, отправим…»).
                store.dispatch(
                    flowStatusActions.setSending({
                        startedAt: 1_000,
                        result: '',
                        operationId: envelope.operationId,
                    }),
                );
                store.dispatch(flowStatusActions.setOutboxQueued());

                vi.useFakeTimers({
                    // Date тоже фейковый: движок сверяет nextAttemptAt по Date.now,
                    // и с настоящей датой продвинутый setTimeout-бэкофф выглядел бы
                    // «из будущего» — ретрай отсеялся бы как backoff.
                    toFake: ['setTimeout', 'clearTimeout', 'Date'],
                    // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
                    shouldAdvanceTime: true,
                });

                store.dispatch(appActions.setInitializedSuccess({}));

                // Продвигаем сессионный бэкофф дренажа (2с и 5с) порциями: каждая
                // проверка двигает фейковое время, пока не случились все три POST
                // (жёсткие прыжки гонялись бы с 0мс-коммитами фейкового IndexedDB).
                await waitFor(
                    async () => {
                        await vi.advanceTimersByTimeAsync(500);
                        expect(sendFlowMock).toHaveBeenCalledTimes(3);
                    },
                    { timeout: 10_000 },
                );

                // Фолбэк-пас исполнил напрямую: конверт partial, flowStatus честно
                // сменил стадию — DONE + PARTIAL + цель direct-bitrix (фон, без
                // cleanEvent/reloadApp — их в buildDrainOptions просто нет).
                await waitFor(async () => {
                    const stored = await readOutboxEnvelope(
                        TEST_DOMAIN,
                        envelope.operationId,
                    );

                    expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
                });
                await waitFor(() => {
                    const flow = store.getState().flowStatus;

                    expect(flow.stage).toBe(FLOW_STAGE.DONE);
                    expect(flow.outboxState).toBe(FLOW_OUTBOX_STATE.PARTIAL);
                    expect(flow.deliveryTarget).toBe('direct-bitrix');
                });
                vi.useRealTimers();

                // Зеркало видит partial: бейдж скажет «1 отчёт ждёт досылки».
                expect(store.getState().outbox.undeliveredCount).toBe(1);
                expect(store.getState().outbox.partialCount).toBe(1);
            },
        );

        it(
            'конверт чужой сессии исполнен напрямую — flowStatus не трогается',
            { timeout: 15_000 },
            async () => {
                mountWindowWithOnline();

                sendFlowMock.mockRejectedValue(
                    Object.assign(new Error('backend down'), {
                        isAxiosError: true,
                    }),
                );
                directOutcomeMock.mockResolvedValue({
                    status: 'executed',
                    executedDirect: true,
                    deferred: [],
                    addedTaskId: null,
                    portalSnapshotAt: null,
                });

                const envelope = makeEnvelope();

                await writeOutboxEnvelope(envelope);

                const store = makeStore();

                // Текущая отправка — ДРУГАЯ операция.
                store.dispatch(
                    flowStatusActions.setSending({
                        startedAt: 1_000,
                        result: '',
                        operationId: 'op-другой',
                    }),
                );

                vi.useFakeTimers({
                    // Date фейковый — та же причина, что в тесте выше.
                    toFake: ['setTimeout', 'clearTimeout', 'Date'],
                    shouldAdvanceTime: true,
                });

                store.dispatch(appActions.setInitializedSuccess({}));

                await waitFor(
                    async () => {
                        await vi.advanceTimersByTimeAsync(500);
                        expect(sendFlowMock).toHaveBeenCalledTimes(3);
                    },
                    { timeout: 10_000 },
                );

                await waitFor(async () => {
                    const stored = await readOutboxEnvelope(
                        TEST_DOMAIN,
                        envelope.operationId,
                    );

                    expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
                });
                vi.useRealTimers();

                // чужой конверт стадию текущей отправки не трогает
                const flow = store.getState().flowStatus;

                expect(flow.stage).toBe(FLOW_STAGE.SENDING);
                expect(flow.deliveryTarget).toBeNull();
            },
        );
    },
);

describe(
    'неполное прямое исполнение из дренажа × flowStatus (MAJOR-2)',
    { timeout: 20_000 },
    () => {
        it(
            'дренаж провёл ТЕКУЩУЮ операцию не целиком: DONE + INCOMPLETE, без обещаний',
            { timeout: 15_000 },
            async () => {
                mountWindowWithOnline();

                sendFlowMock.mockRejectedValue(
                    Object.assign(new Error('backend down'), {
                        isAxiosError: true,
                    }),
                );
                // Батч ушёл, обязательная команда без ответа: доисполнить нечем.
                directOutcomeMock.mockResolvedValue({
                    status: 'incomplete',
                    executedDirect: true,
                    failedCommands: ['complete_task_9'],
                    detail: 'обязательные команды пишущего батча не применились',
                    deferred: [{ kind: 'kpi' }],
                    addedTaskId: null,
                    portalSnapshotAt: 42_000,
                    directAttempted: { at: 1, markerTaskId: 9 },
                });

                const envelope = makeEnvelope();

                await writeOutboxEnvelope(envelope);

                const store = makeStore();

                store.dispatch(
                    flowStatusActions.setSending({
                        startedAt: 1_000,
                        result: '',
                        operationId: envelope.operationId,
                    }),
                );
                store.dispatch(flowStatusActions.setOutboxQueued());

                vi.useFakeTimers({
                    toFake: ['setTimeout', 'clearTimeout', 'Date'],
                    shouldAdvanceTime: true,
                });

                store.dispatch(appActions.setInitializedSuccess({}));

                await waitFor(
                    async () => {
                        await vi.advanceTimersByTimeAsync(500);
                        expect(sendFlowMock).toHaveBeenCalledTimes(3);
                    },
                    { timeout: 10_000 },
                );

                await waitFor(async () => {
                    const stored = await readOutboxEnvelope(
                        TEST_DOMAIN,
                        envelope.operationId,
                    );

                    expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
                    expect(stored?.directFailedCommands).toEqual([
                        'complete_task_9',
                    ]);
                });
                await waitFor(() => {
                    const flow = store.getState().flowStatus;

                    expect(flow.stage).toBe(FLOW_STAGE.DONE);
                    expect(flow.outboxState).toBe(FLOW_OUTBOX_STATE.INCOMPLETE);
                    expect(flow.deliveryTarget).toBe('direct-bitrix');
                });
                vi.useRealTimers();

                // Бейдж такой конверт не считает: доставлять его больше некому.
                expect(store.getState().outbox.undeliveredCount).toBe(0);
                expect(store.getState().outbox.partialCount).toBe(0);
            },
        );
    },
);
