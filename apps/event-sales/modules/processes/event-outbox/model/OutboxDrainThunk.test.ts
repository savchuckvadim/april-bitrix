import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
} from '../lib/outbox-envelope';
import {
    OUTBOX_BACKOFF_DELAYS_MS,
    deliverOutboxEnvelope,
} from '../lib/outbox-delivery';
import {
    OUTBOX_DELIVERED_TTL_MS,
    listOutboxEnvelopes,
    readOutboxEnvelope,
    writeOutboxEnvelope,
} from '../lib/outbox-store';
import {
    TEST_DOMAIN,
    makeClock,
    makeEnvelope,
    makeFakeLockManager,
    makeTarget,
    makeThunkHarness,
    mountDefaultKvWindow,
    mountKvWindow,
} from '../lib/outbox-test-kit';
import {
    PRIMARY_BACKEND_TARGET_ID,
    type DeliveryTarget,
} from '../lib/delivery-targets';
import { outboxActions } from './OutboxSlice';
import {
    OUTBOX_DRAIN_INTERVAL_MS,
    armOutboxDrainTimer,
    drainOutbox,
    stopOutboxDrainTimer,
} from './OutboxDrainThunk';

/**
 * Дренаж: берёт ровно положенные состояния, перехватывает протухшие lease,
 * не дерётся между вкладками, гасит конверты терминальным статусом из
 * повторного POST, убирает старые delivered и чтит кап домена.
 */

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // След прогона (старт и итог) — часть контракта дренажа:
    // глушим шум, но читаем в тестах видимости ниже.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mountDefaultKvWindow();
});

afterEach(() => {
    stopOutboxDrainTimer();
    vi.useRealTimers();
    vi.restoreAllMocks();
    mountKvWindow(null);
});

const ACCEPTED_QUEUED = {
    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
    operationStatus: 'queued',
} as const;

/**
 * Дожать 0мс-коммиты фейкового IndexedDB: durability-семантика kv-storage
 * завершает транзакцию через setTimeout(0), и после storage-операций такие
 * таймеры висят в счётчике. После дожима остаются только таймеры дренажа.
 */
const flushIdbCommitTimers = () => vi.advanceTimersByTimeAsync(0);

describe('drainOutbox: выборка кандидатов', () => {
    it('берёт pending / delivering-протухший / сетевой failed по сроку — и только их', async () => {
        const { now, wait } = makeClock();
        const due = now();

        const pending = makeEnvelope({ createdAt: 1 });
        const staleDelivering = makeEnvelope({
            createdAt: 2,
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: due - 1 },
        });
        const aliveDelivering = makeEnvelope({
            createdAt: 3,
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-live', until: due + 30_000 },
        });
        const dueNetworkFailed = makeEnvelope({
            createdAt: 4,
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: due - 100,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
            nextAttemptAt: due - 1,
        });
        const futureNetworkFailed = makeEnvelope({
            createdAt: 5,
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: due - 100,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
            nextAttemptAt: due + 60_000,
        });
        const rejectedFailed = makeEnvelope({
            createdAt: 6,
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: due - 100,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
            nextAttemptAt: null,
        });
        const delivered = makeEnvelope({
            createdAt: 7,
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: due,
        });
        const partial = makeEnvelope({
            createdAt: 8,
            state: OUTBOX_ENVELOPE_STATE.partial,
        });
        const foreignVersion = makeEnvelope({ createdAt: 9, v: 99 });

        for (const envelope of [
            pending,
            staleDelivering,
            aliveDelivering,
            dueNetworkFailed,
            futureNetworkFailed,
            rejectedFailed,
            delivered,
            partial,
            foreignVersion,
        ]) {
            await writeOutboxEnvelope(envelope);
        }

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        // доставлены только трое положенных, строго старые первыми
        expect(target.calls.map(c => c.operationId)).toEqual([
            pending.operationId,
            staleDelivering.operationId,
            dueNetworkFailed.operationId,
        ]);
    });

    it('протухший lease перехвачен: конверт уходит и получает lease дренящей вкладки', async () => {
        const { now, wait } = makeClock();
        const stale = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: now() - 10 },
        });

        await writeOutboxEnvelope(stale);

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        const stored = await readOutboxEnvelope(TEST_DOMAIN, stale.operationId);

        expect(target.calls).toHaveLength(1);
        expect(stored?.lease?.tabId).toBe('tab-b');
    });

    it('домен ещё не известен — дренаж молча выходит', async () => {
        const { dispatch, actions } = makeThunkHarness('');

        await dispatch(drainOutbox({ rearm: false }));

        expect(actions).toEqual([]);
    });
});

describe('drainOutbox: исход повторного POST', () => {
    it('операция уже done — конверт гасится без поллинга', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([
            {
                outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                operationStatus: 'done',
            },
        ]);
        const { dispatch, actions } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);

        const counts = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .map(a => (a.payload as { count: number }).count);

        expect(counts.at(-1)).toBe(0);
    });

    it('операция failed — конверт помечен отказом с деталью', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([
            {
                outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                operationStatus: 'failed',
                detail: 'нет стадии сделки',
            },
        ]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.at(-1)).toMatchObject({
            outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
            detail: 'нет стадии сделки',
        });
    });

    it('операция ещё в очереди — конверт остаётся delivering, зовётся onAccepted', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const onAccepted = vi.fn();
        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                onAccepted,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(onAccepted).toHaveBeenCalledTimes(1);
        expect(onAccepted.mock.calls[0]![0]).toMatchObject({
            operationId: envelope.operationId,
        });
    });
});

describe('drainOutbox: сверка статуса перед повторной доставкой (checkStatus)', () => {
    const staleDelivering = () =>
        makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: 0 },
        });

    const drainWith = async (
        target: ReturnType<typeof makeTarget>,
        now: () => number,
        wait: (ms: number) => Promise<void>,
    ) => {
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );
    };

    it('статус done — конверт гасится БЕЗ повторного POST', async () => {
        const { now, wait } = makeClock();
        const envelope = staleDelivering();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'status', operationStatus: 'done' }],
        });

        await drainWith(target, now, wait);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(target.checkCalls).toEqual([envelope.operationId]);
        expect(target.calls).toHaveLength(0);
    });

    it('статус failed — конверт помечен отказом с деталью, без POST', async () => {
        const { now, wait } = makeClock();
        const envelope = staleDelivering();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [
                {
                    kind: 'status',
                    operationStatus: 'failed',
                    detail: 'нет стадии сделки',
                },
            ],
        });

        await drainWith(target, now, wait);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.at(-1)).toMatchObject({
            outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
            detail: 'нет стадии сделки',
        });
        expect(target.calls).toHaveLength(0);
    });

    it('операция ещё в работе (running) — конверт не трогаем и не шлём', async () => {
        const { now, wait } = makeClock();
        const envelope = staleDelivering();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'status', operationStatus: 'running' }],
        });

        await drainWith(target, now, wait);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(stored?.updatedAt).toBe(envelope.updatedAt);
        expect(target.calls).toHaveLength(0);
    });

    it('статус-эндпоинт недоступен — конверт оставляем как есть', async () => {
        const { now, wait } = makeClock();
        const envelope = staleDelivering();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'unavailable' }],
        });

        await drainWith(target, now, wait);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(target.calls).toHaveLength(0);
    });

    it('not-found без accepted-попыток: POST не долетал — повторная доставка', async () => {
        const { now, wait } = makeClock();
        const envelope = staleDelivering();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'not-found' }],
        });

        await drainWith(target, now, wait);

        expect(target.checkCalls).toEqual([envelope.operationId]);
        expect(target.calls.map(c => c.operationId)).toEqual([
            envelope.operationId,
        ]);
    });

    it('not-found ПОСЛЕ accepted: статус истёк — повторно не шлём, warn', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: 0 },
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                },
            ],
        });

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'not-found' }],
        });

        await drainWith(target, now, wait);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(target.calls).toHaveLength(0);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('статус истёк'),
            envelope.operationId,
        );
    });

    it('pending-конверт без accepted статусом не сверяется — сразу доставка', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'status', operationStatus: 'done' }],
        });

        await drainWith(target, now, wait);

        expect(target.checkCalls).toHaveLength(0);
        expect(target.calls).toHaveLength(1);
    });

    // Ретрай «Повторить» слил accepted первой отправки в историю
    // (mergeRequeuedEnvelope), а сам лёг сетью: конверт failed(network), но
    // улика «бэк уже принимал операцию» на месте — перед досылкой обязана
    // идти сверка статуса, иначе после истечения статуса (час) слепой POST
    // выполнил бы flow второй раз.
    const failedAfterAcceptedRetry = (due: number) =>
        makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                },
                {
                    targetId: 'primary-backend',
                    at: 2_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
            nextAttemptAt: due - 1,
        });

    it('failed с accepted в истории: not-found — повторно не шлём, warn', async () => {
        const { now, wait } = makeClock();
        const envelope = failedAfterAcceptedRetry(now());

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'not-found' }],
        });

        await drainWith(target, now, wait);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(target.checkCalls).toEqual([envelope.operationId]);
        expect(target.calls).toHaveLength(0);
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('статус истёк'),
            envelope.operationId,
        );
    });

    it('failed с accepted: статус done — конверт гасится без повторного POST', async () => {
        const { now, wait } = makeClock();
        const envelope = failedAfterAcceptedRetry(now());

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'status', operationStatus: 'done' }],
        });

        await drainWith(target, now, wait);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(target.calls).toHaveLength(0);
    });

    it('сетевой failed БЕЗ accepted сверки не заслуживает — сразу доставка', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
            nextAttemptAt: now() - 1,
        });

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED], {
            checkStatus: [{ kind: 'status', operationStatus: 'done' }],
        });

        await drainWith(target, now, wait);

        expect(target.checkCalls).toHaveLength(0);
        expect(target.calls).toHaveLength(1);
    });
});

describe('терминальные швы onDelivered / onFailedTerminal', () => {
    const seams = () => ({
        onDelivered: vi.fn(),
        onFailedTerminal: vi.fn(),
    });

    const drainWithSeams = async (
        target: ReturnType<typeof makeTarget>,
        hooks: ReturnType<typeof seams>,
    ) => {
        const { now, wait } = makeClock();
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                ...hooks,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );
    };

    it('повторный POST вернул done: onDelivered зовётся после гашения', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const hooks = seams();

        await drainWithSeams(
            makeTarget([
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                    operationStatus: 'done',
                },
            ]),
            hooks,
        );

        expect(hooks.onDelivered).toHaveBeenCalledTimes(1);
        expect(hooks.onDelivered.mock.calls[0]![0]).toMatchObject({
            operationId: envelope.operationId,
        });
        expect(hooks.onFailedTerminal).not.toHaveBeenCalled();
        // конверт к моменту шва уже погашен markDelivered
        await expect(
            readOutboxEnvelope(TEST_DOMAIN, envelope.operationId),
        ).resolves.toMatchObject({ state: OUTBOX_ENVELOPE_STATE.delivered });
    });

    it('повторный POST вернул failed: onFailedTerminal с деталью', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const hooks = seams();

        await drainWithSeams(
            makeTarget([
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                    operationStatus: 'failed',
                    detail: 'нет стадии сделки',
                },
            ]),
            hooks,
        );

        expect(hooks.onFailedTerminal).toHaveBeenCalledTimes(1);
        expect(hooks.onFailedTerminal.mock.calls[0]![0]).toMatchObject({
            operationId: envelope.operationId,
        });
        expect(hooks.onFailedTerminal.mock.calls[0]![1]).toBe(
            'нет стадии сделки',
        );
        expect(hooks.onDelivered).not.toHaveBeenCalled();
    });

    it('сверка статуса done: onDelivered и для ветки checkStatus', async () => {
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: 0 },
        });

        await writeOutboxEnvelope(envelope);

        const hooks = seams();

        await drainWithSeams(
            makeTarget([ACCEPTED_QUEUED], {
                checkStatus: [{ kind: 'status', operationStatus: 'done' }],
            }),
            hooks,
        );

        expect(hooks.onDelivered).toHaveBeenCalledTimes(1);
        expect(hooks.onDelivered.mock.calls[0]![0]).toMatchObject({
            operationId: envelope.operationId,
        });
        expect(hooks.onFailedTerminal).not.toHaveBeenCalled();
    });

    it('сверка статуса failed: onFailedTerminal с деталью', async () => {
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: 0 },
        });

        await writeOutboxEnvelope(envelope);

        const hooks = seams();

        await drainWithSeams(
            makeTarget([ACCEPTED_QUEUED], {
                checkStatus: [
                    {
                        kind: 'status',
                        operationStatus: 'failed',
                        detail: 'нет стадии сделки',
                    },
                ],
            }),
            hooks,
        );

        expect(hooks.onFailedTerminal).toHaveBeenCalledTimes(1);
        expect(hooks.onFailedTerminal.mock.calls[0]![1]).toBe(
            'нет стадии сделки',
        );
        expect(hooks.onDelivered).not.toHaveBeenCalled();
    });

    it('нетерминальный accepted (queued): терминальные швы молчат', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const hooks = seams();

        await drainWithSeams(makeTarget([ACCEPTED_QUEUED]), hooks);

        expect(hooks.onDelivered).not.toHaveBeenCalled();
        expect(hooks.onFailedTerminal).not.toHaveBeenCalled();
    });
});

describe('эксклюзивность вкладок', () => {
    it('конверт под локом другой «вкладки» дренаж не трогает', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const locks = makeFakeLockManager();

        // «вкладка A» начала доставку и повисла на цели
        let releaseA!: () => void;
        const gate = new Promise<void>(resolve => (releaseA = resolve));
        let started!: () => void;
        const startedPromise = new Promise<void>(
            resolve => (started = resolve),
        );
        const calls: string[] = [];
        const hangingTarget: DeliveryTarget = {
            id: 'hanging',
            deliver: async e => {
                calls.push(`A:${e.operationId}`);
                started();
                await gate;
                return ACCEPTED_QUEUED;
            },
        };
        const deliveryA = deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [hangingTarget], now, wait, tabId: 'tab-a', locks },
        );

        await startedPromise;

        // «вкладка B» дренит тот же домен. Её часы сдвинуты за протухание
        // lease: по записи конверт выглядит брошенным, но живой лок вкладки A
        // всё равно не пускает — перехват возможен только после смерти A.
        const nowB = () => now() + 61_000;
        const targetB = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [targetB],
                    now: nowB,
                    wait,
                    tabId: 'tab-b',
                    locks,
                },
            }),
        );

        expect(targetB.calls).toHaveLength(0);

        releaseA();
        await expect(deliveryA).resolves.toMatchObject({
            status: 'accepted',
        });
        // доставила ровно одна вкладка
        expect(calls).toEqual([`A:${envelope.operationId}`]);
    });

    it('без Web Locks два tabId разводит живой lease в конверте', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-a', until: now() + 30_000 },
        });

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        expect(target.calls).toHaveLength(0);
    });
});

describe('уборка и кап', () => {
    it('delivered старше суток удаляются из хранилища', async () => {
        const { now, wait } = makeClock();
        const old = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: now() - OUTBOX_DELIVERED_TTL_MS - 1,
        });
        const fresh = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: now(),
        });

        await writeOutboxEnvelope(old);
        await writeOutboxEnvelope(fresh);

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        const rest = await listOutboxEnvelopes(TEST_DOMAIN);

        expect(rest.map(e => e.operationId)).toEqual([fresh.operationId]);
        expect(target.calls).toHaveLength(0);
    });

    it('отвергнутый failed старше суток удаляется — бессмертных конвертов нет', async () => {
        const { now, wait } = makeClock();
        const oldRejected = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: 1,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
            updatedAt: now() - OUTBOX_DELIVERED_TTL_MS - 1,
        });
        const freshRejected = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: 1,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
            updatedAt: now(),
        });

        await writeOutboxEnvelope(oldRejected);
        await writeOutboxEnvelope(freshRejected);

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        const rest = await listOutboxEnvelopes(TEST_DOMAIN);

        // свежий отвергнутый ещё лежит следом для разбора, протухший ушёл
        expect(rest.map(e => e.operationId)).toEqual([
            freshRejected.operationId,
        ]);
        // доставке отвергнутые по-прежнему не предлагаются
        expect(target.calls).toHaveLength(0);
    });

    it('сверх капа: старые delivered удалены, недоставленные целы + warn', async () => {
        const { now, wait } = makeClock();
        // 49 недоставленных сетевых failed в бэкоффе (дренаж их ещё не
        // шлёт, а удалять нельзя) + 3 свежих delivered
        const undelivered = Array.from({ length: 49 }, () =>
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.failed,
                attempts: [
                    {
                        targetId: 't',
                        at: 1,
                        outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    },
                ],
                nextAttemptAt: now() + 60_000,
            }),
        );
        const delivered = Array.from({ length: 3 }, (_, i) =>
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.delivered,
                updatedAt: now() - 1_000 - i,
            }),
        );

        for (const envelope of [...undelivered, ...delivered]) {
            await writeOutboxEnvelope(envelope);
        }

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        const rest = await listOutboxEnvelopes(TEST_DOMAIN);

        // 52 − кап 50 = 2 лишних: удалены 2 старейших delivered, остальное цело
        expect(rest).toHaveLength(50);
        expect(
            rest.filter(e => e.state === OUTBOX_ENVELOPE_STATE.failed),
        ).toHaveLength(49);
        expect(
            rest
                .filter(e => e.state === OUTBOX_ENVELOPE_STATE.delivered)
                .map(e => e.operationId),
        ).toEqual([delivered[0]!.operationId]);
    });

    it('недоставленных больше капа — только предупреждение, без удалений', async () => {
        const { now, wait } = makeClock();
        // сетевые failed в бэкоффе: недоставленные, удалять запрещено
        const undelivered = Array.from({ length: 51 }, () =>
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.failed,
                attempts: [
                    {
                        targetId: 't',
                        at: 1,
                        outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    },
                ],
                nextAttemptAt: now() + 60_000,
            }),
        );

        for (const envelope of undelivered) {
            await writeOutboxEnvelope(envelope);
        }

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        expect(await listOutboxEnvelopes(TEST_DOMAIN)).toHaveLength(51);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('больше капа'),
        );
    });
});

describe('фоновый таймер', () => {
    it('взводится, пока есть недоставленные, и не взводится на чистом домене', async () => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
            // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
            // (durability-семантика kv-storage): без автопродвижения времени
            // awaited-записи конвертов зависли бы под фейковыми таймерами
            shouldAdvanceTime: true,
        });

        const { now, wait } = makeClock();
        // сетевой failed в бэкоффе: недоставленный, этим прогоном не уйдёт
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: 1,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
            nextAttemptAt: now() + 60_000,
        });

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(1);
        stopOutboxDrainTimer();
        expect(vi.getTimerCount()).toBe(0);

        // всё доставлено — перезаряжать нечего
        await writeOutboxEnvelope({
            ...envelope,
            state: OUTBOX_ENVELOPE_STATE.delivered,
            attempts: [],
            updatedAt: now(),
        });
        await dispatch(
            drainOutbox({
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );
        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('rejected-only бэклог: счётчик 0 и таймер не взводится', async () => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
            // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
            // (durability-семантика kv-storage): без автопродвижения времени
            // awaited-записи конвертов зависли бы под фейковыми таймерами
            shouldAdvanceTime: true,
        });

        const { now, wait } = makeClock();
        // свежий отвергнутый: TTL не пришёл, конверт лежит следом — но он
        // терминален, дослать его дренаж не вправе, поэтому крутить 60с-
        // таймер по кругу пустых прогонов из-за него нельзя
        const rejected = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: 1,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
            updatedAt: now() - 1_000,
        });

        await writeOutboxEnvelope(rejected);

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch, actions } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        // конверт цел, но в бейдж «ждут отправки» больше не считается…
        expect(await listOutboxEnvelopes(TEST_DOMAIN)).toHaveLength(1);

        const counts = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .map(a => (a.payload as { count: number }).count);

        expect(counts.at(-1)).toBe(0);
        // …конец прогона таймер не перезарядил, а листенер setUndelivered
        // (armOutboxDrainTimer) на счётчике 0 взводить его не станет
        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(0);
        expect(target.calls).toHaveLength(0);
    });
});

describe('armOutboxDrainTimer: взвод вне прогона', () => {
    it('взводится один раз и по сроку сам запускает дренаж', async () => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
            // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
            // (durability-семантика kv-storage): без автопродвижения времени
            // awaited-записи конвертов зависли бы под фейковыми таймерами
            shouldAdvanceTime: true,
        });

        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([
            {
                outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                operationStatus: 'done',
            },
        ]);
        const { dispatch } = makeThunkHarness();
        const options = {
            deps: {
                targets: [target],
                now,
                wait,
                tabId: 'tab-b',
                locks: null,
            },
            rearm: false,
        };

        armOutboxDrainTimer(dispatch, options);
        armOutboxDrainTimer(dispatch, options); // повторный взвод — молчит

        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(1);

        await vi.advanceTimersByTimeAsync(OUTBOX_DRAIN_INTERVAL_MS);

        // хвост дренажа доезжает на автопродвижении времени — ждём исход
        await vi.waitFor(async () => {
            const stored = await readOutboxEnvelope(
                TEST_DOMAIN,
                envelope.operationId,
            );

            expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        });
        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('во время прогона молчит: перезарядкой владеет конец прогона', async () => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
            // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
            // (durability-семантика kv-storage): без автопродвижения времени
            // awaited-записи конвертов зависли бы под фейковыми таймерами
            shouldAdvanceTime: true,
        });

        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        // Цель, застревающая на deliver: держит прогон открытым, пока тест
        // проверяет взвод, и отпускается вручную.
        let releaseDeliver!: () => void;
        const gate = new Promise<void>(resolve => {
            releaseDeliver = resolve;
        });
        let markStarted!: () => void;
        const started = new Promise<void>(resolve => {
            markStarted = resolve;
        });
        const target: DeliveryTarget = {
            id: 'slow-target',
            deliver: async () => {
                markStarted();
                await gate;

                return {
                    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                    operationStatus: 'done',
                };
            },
        };
        const { dispatch } = makeThunkHarness();
        const deps = {
            targets: [target],
            now,
            wait,
            tabId: 'tab-b',
            locks: null,
        };

        const run = dispatch(drainOutbox({ deps, rearm: false }));

        await started;
        armOutboxDrainTimer(dispatch, { deps, rearm: false });
        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(0); // прогон идёт — взвод пропущен

        releaseDeliver();
        await run;
        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(0); // rearm: false — конец не взводил
    });
});

describe('partial-конверты (А4) — констрейнт до эндпоинта А5', () => {
    it('дренаж их не подбирает, конверт лежит нетронутым, а бейдж их считает', async () => {
        const { now, wait } = makeClock();
        const partial = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.partial,
            executedDirect: true,
            deferred: [{ kind: 'kpi' }],
        });

        await writeOutboxEnvelope(partial);

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch, actions } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        // не кандидат: ни одна цель не тронута (слать исходный payload на
        // primary после прямого исполнения нельзя — запрет А5)
        expect(target.calls).toHaveLength(0);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            partial.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.deferred).toEqual([{ kind: 'kpi' }]);

        // зеркало честно считает его недоставленным и помечает partial —
        // полоска скажет «1 отчёт ждёт досылки»
        const last = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .at(-1);

        expect(last?.payload).toEqual({
            domain: TEST_DOMAIN,
            count: 1,
            partialCount: 1,
            incompleteCount: 0,
        });
    });

    it('хвост partial-конверта уезжает на /flow/deferred и гасит конверт', async () => {
        // А5: служебную часть (KPI, движения сделок, анкета в смарте)
        // браузер провести не мог — прав нет. Отправлять конверт целиком
        // нельзя, поэтому едут только семантические шаги.
        const { now, wait } = makeClock();

        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.partial,
            executedDirect: true,
            deferred: [
                { kind: 'kpi' },
                {
                    kind: 'side-flow',
                    flow: 'zpr',
                    addedTaskId: 42,
                    createdPresDealId: null,
                },
            ],
        });

        await writeOutboxEnvelope(envelope);

        const sent: unknown[] = [];
        const delivered: string[] = [];
        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
                onTailDelivered: envelope =>
                    delivered.push(envelope.operationId),
                sendDeferredTail: async request => {
                    sent.push(request);

                    return {
                        accepted: true,
                        operationId: request.operationId,
                        steps: request.steps.map(step => ({
                            kind: step.kind,
                            status: 'executed' as const,
                        })),
                        completed: true,
                        pending: [],
                        commandsCount: 4,
                        warnings: [],
                    };
                },
            }),
        );

        // ИСХОДНЫЙ payload на primary не уехал — это и есть запрет А5.
        expect(target.calls).toHaveLength(0);
        expect(sent).toHaveLength(1);
        expect(sent[0]).toMatchObject({
            domain: TEST_DOMAIN,
            steps: [{ kind: 'kpi' }, { kind: 'side-flow', flow: 'zpr' }],
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(stored?.deferred).toEqual([]);
        // След прямого исполнения переживает досылку: иначе primary снова
        // стал бы возможной целью для исходного payload.
        expect(stored?.executedDirect).toBe(true);
        expect(delivered).toEqual([envelope.operationId]);
    });

    it('часть хвоста упала — конверт остаётся partial, но хвост сужается', async () => {
        const { now, wait } = makeClock();

        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.partial,
            executedDirect: true,
            deferred: [
                { kind: 'kpi' },
                { kind: 'xo-deals' },
                {
                    kind: 'side-flow',
                    flow: 'pres',
                    addedTaskId: null,
                    createdPresDealId: 1024,
                },
            ],
        });

        await writeOutboxEnvelope(envelope);

        const delivered: string[] = [];
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [makeTarget([ACCEPTED_QUEUED])],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
                onTailDelivered: envelope =>
                    delivered.push(envelope.operationId),
                sendDeferredTail: async request => ({
                    accepted: true,
                    operationId: request.operationId,
                    steps: [],
                    completed: false,
                    // сервер называет неисполненные шаги своими ключами
                    pending: ['xo-deals', 'side-flow:pres'],
                    commandsCount: 2,
                    warnings: ['payload.operationId пуст'],
                }),
            }),
        );

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        // исполненный kpi выброшен, неисполненные — сохранены целиком
        expect(stored?.deferred).toEqual([
            { kind: 'xo-deals' },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: null,
                createdPresDealId: 1024,
            },
        ]);
        expect(delivered).toEqual([]);
    });

    it('досылка не удалась — хвост и состояние конверта не тронуты', async () => {
        const { now, wait } = makeClock();
        const tail = [{ kind: 'kpi' as const }];

        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.partial,
            executedDirect: true,
            deferred: tail,
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [makeTarget([ACCEPTED_QUEUED])],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
                sendDeferredTail: async () => {
                    throw new Error('backend down');
                },
            }),
        );

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.deferred).toEqual(tail);
    });

    it('только-partial бэклог таймер 60с ДЕРЖИТ: его хвост возит пас А5', async () => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
            // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
            // (durability-семантика kv-storage): без автопродвижения времени
            // awaited-записи конвертов зависли бы под фейковыми таймерами
            shouldAdvanceTime: true,
        });

        const { now, wait } = makeClock();

        await writeOutboxEnvelope(
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.partial,
                executedDirect: true,
                deferred: [{ kind: 'kpi' }],
            }),
        );

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch, actions } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
                // сервер всё ещё лежит: досылка хвоста не удалась
                sendDeferredTail: async () => {
                    throw new Error('backend down');
                },
            }),
        );

        // бейдж их по-прежнему считает (семантика счётчика не менялась)…
        const mirror = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .at(-1)?.payload as { count: number; partialCount: number };

        expect(mirror).toMatchObject({ count: 1, partialCount: 1 });
        // …и таймер такой конверт держит: его служебный хвост увозит пас
        // досылки (А5). В общий цикл он при этом не попадает — исходный
        // payload на primary слать нельзя.
        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(1);
        expect(target.calls).toHaveLength(0);
    });

    it('partial рядом с ретраебельным: таймер держит второй, не partial', async () => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
            // фейковый IndexedDB коммитит транзакцию через setTimeout(0)
            // (durability-семантика kv-storage): без автопродвижения времени
            // awaited-записи конвертов зависли бы под фейковыми таймерами
            shouldAdvanceTime: true,
        });

        const { now, wait } = makeClock();

        await writeOutboxEnvelope(
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.partial,
                executedDirect: true,
                deferred: [{ kind: 'kpi' }],
            }),
        );
        // сетевой failed в бэкоффе: этим прогоном не уйдёт, а следующим —
        // вполне; ради него таймер и живёт
        await writeOutboxEnvelope(
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.failed,
                attempts: [
                    {
                        targetId: 't',
                        at: 1,
                        outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    },
                ],
                nextAttemptAt: now() + 60_000,
            }),
        );

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        await flushIdbCommitTimers();
        expect(vi.getTimerCount()).toBe(1);
        stopOutboxDrainTimer();
    });
});

describe('дренаж исполняет конверт напрямую (А4): шов onExecutedDirect', () => {
    it('успех с хвостом: конверт partial, шов получает конверт и итог', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    direct: {
                        deferred: [{ kind: 'kpi' }],
                        portalSnapshotAt: 42_000,
                    },
                },
            ],
            { id: 'direct-bitrix' },
        );
        const { dispatch } = makeThunkHarness();
        const executed: Array<{ operationId: string; state: string }> = [];

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [direct],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
                onExecutedDirect: (candidate, summary) => {
                    executed.push({
                        operationId: candidate.operationId,
                        state: summary.envelopeState,
                    });
                },
            }),
        );

        expect(executed).toEqual([
            { operationId: envelope.operationId, state: 'partial' },
        ]);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.executedDirect).toBe(true);
    });

    it('успех без хвоста: конверт delivered, шов сообщает delivered', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    direct: { deferred: [], portalSnapshotAt: null },
                },
            ],
            { id: 'direct-bitrix' },
        );
        const { dispatch } = makeThunkHarness();
        const states: string[] = [];

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [direct],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
                onExecutedDirect: (_candidate, summary) => {
                    states.push(summary.envelopeState);
                },
            }),
        );

        expect(states).toEqual(['delivered']);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
    });
});

describe('drainOutbox: конверт с отметкой прямого пути (directAttempted)', () => {
    /**
     * Главный сценарий MAJOR-1: прямой пишущий батч ушёл в Битрикс, ответ
     * потерян, бэк ОЖИЛ. Дренаж обязан не трогать primary исходным payload
     * (иначе вторая план-задача, второй комментарий истории, повторное
     * движение сделок), а отдать конверт прямой цели — та сверит маркер.
     */
    const attemptedFailed = (due: number) =>
        makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            directAttempted: { at: due - 60_000, markerTaskId: 3001 },
            attempts: [
                {
                    targetId: 'direct-bitrix',
                    at: due - 30_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
            nextAttemptAt: due - 1,
        });

    it('живой бэк не получает ни POST, ни сверки статуса — конверт идёт прямой целью', async () => {
        const { now, wait } = makeClock();
        const envelope = attemptedFailed(now());

        await writeOutboxEnvelope(envelope);

        const primary = makeTarget([ACCEPTED_QUEUED], {
            id: PRIMARY_BACKEND_TARGET_ID,
            // Бэк ожил: статус отвечает честным not-found (операции нет).
            checkStatus: [{ kind: 'not-found' }],
        });
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    detail: 'duplicate-marker: исполнено напрямую ранее',
                    direct: {
                        deferred: [{ kind: 'kpi' }],
                        portalSnapshotAt: null,
                    },
                },
            ],
            { id: 'direct-bitrix' },
        );
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [primary, direct],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        expect(primary.calls).toEqual([]);
        expect(primary.checkCalls).toEqual([]);
        expect(direct.calls).toHaveLength(1);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.executedDirect).toBe(true);
        expect(stored?.deferred).toEqual([{ kind: 'kpi' }]);
    });

    it('вечный delivering после смерти вкладки: сверка пропущена, POST не уходит', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: 0 },
            directAttempted: { at: now() - 60_000, markerTaskId: 3001 },
        });

        await writeOutboxEnvelope(envelope);

        const primary = makeTarget([ACCEPTED_QUEUED], {
            id: PRIMARY_BACKEND_TARGET_ID,
            checkStatus: [{ kind: 'not-found' }],
        });
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    detail: 'маркер не прочитался',
                },
            ],
            { id: 'direct-bitrix' },
        );
        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [primary, direct],
                    now,
                    wait,
                    tabId: 'tab-b',
                    locks: null,
                },
            }),
        );

        expect(primary.checkCalls).toEqual([]);
        expect(primary.calls).toEqual([]);
        // Прямая цель отвечает сетевой ошибкой — сессия честно исчерпывает
        // свои три попытки; важно, что ни одна из них не ушла на primary.
        expect(direct.calls).toHaveLength(OUTBOX_BACKOFF_DELAYS_MS.length);
    });
});

/**
 * Видимость недоставленных: пока второго сервера нет, отчёт может
 * пролежать в браузере до следующего входа менеджера — и зеркало с логами
 * обязаны это показывать: что везётся сейчас, что осталось лежать и
 * почему конверт не поехал.
 */
describe('drainOutbox: живое зеркало и логи прогона', () => {
    const logs = (): string[] =>
        (
            console.log as unknown as { mock: { calls: unknown[][] } }
        ).mock.calls.map(call => String(call[0]));

    it('прогон с работой взводит флаг до доставки и снимает в конце', async () => {
        const { now, wait } = makeClock();

        await writeOutboxEnvelope(makeEnvelope());

        const target = makeTarget([ACCEPTED_QUEUED]);
        const { dispatch, actions } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        const draining = actions.filter(
            a => a.type === outboxActions.setDraining.type,
        );

        expect(draining.map(a => a.payload)).toEqual([true, false]);
        // Флаг — первым делом: именно он говорит «отправляем», пока
        // счётчики ещё не сведены (они уезжают в КОНЦЕ прогона).
        expect(actions.at(0)?.type).toBe(outboxActions.setDraining.type);
        expect(actions.at(-1)?.type).toBe(outboxActions.setDraining.type);
        expect(
            actions.findIndex(
                a => a.type === outboxActions.setUndelivered.type,
            ),
        ).toBeLessThan(actions.length - 1);
    });

    it('холостой прогон молчит: ни флага, ни логов', async () => {
        const { now, wait } = makeClock();
        const { dispatch, actions } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [makeTarget([ACCEPTED_QUEUED])],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        expect(
            actions.some(a => a.type === outboxActions.setDraining.type),
        ).toBe(false);
        expect(logs()).toEqual([]);
    });

    it('лог старта называет состав работы и причины пропусков', async () => {
        const { now, wait } = makeClock();

        await writeOutboxEnvelope(makeEnvelope({ createdAt: 1 }));
        // Проведён не целиком: доставлять его некому (skip `state`).
        await writeOutboxEnvelope(
            makeEnvelope({
                createdAt: 2,
                state: OUTBOX_ENVELOPE_STATE.failed,
                executedDirect: true,
                directFailedCommands: ['complete_task_77'],
                attempts: [
                    {
                        targetId: 'direct-bitrix',
                        at: 900,
                        outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
                    },
                ],
                nextAttemptAt: null,
            }),
        );

        const { dispatch } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                deps: {
                    targets: [makeTarget([ACCEPTED_QUEUED])],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        const [start, finish] = logs();

        expect(start).toContain(`[event-outbox] дренаж ${TEST_DOMAIN}`);
        expect(start).toContain('конвертов 2');
        expect(start).toContain('к отправке 1');
        expect(start).toContain('пропущено (state 1)');
        expect(finish).toContain('завершён');
        expect(finish).toContain('принято 1');
        expect(finish).toContain('Осталось недоставленных 1');
        expect(finish).toContain('проведено не целиком 1');
    });

    it('зеркало везёт тревожный счёт отдельно от недоставленных', async () => {
        const { now, wait } = makeClock();

        await writeOutboxEnvelope(
            makeEnvelope({
                createdAt: 1,
                state: OUTBOX_ENVELOPE_STATE.failed,
                executedDirect: true,
                directFailedCommands: ['complete_task_77', 'update_deal_5'],
                attempts: [
                    {
                        targetId: 'direct-bitrix',
                        at: 900,
                        outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
                    },
                ],
                nextAttemptAt: null,
            }),
        );
        await writeOutboxEnvelope(
            makeEnvelope({
                createdAt: 2,
                state: OUTBOX_ENVELOPE_STATE.partial,
                deferred: [{ kind: 'kpi' }],
            }),
        );

        const { dispatch, actions } = makeThunkHarness();

        await dispatch(
            drainOutbox({
                rearm: false,
                sendDeferredTail: async () => {
                    throw new Error('бэк молчит');
                },
                deps: {
                    targets: [makeTarget([ACCEPTED_QUEUED])],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        const mirror = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .at(-1);

        expect(mirror?.payload).toEqual({
            domain: TEST_DOMAIN,
            count: 1,
            partialCount: 1,
            incompleteCount: 1,
        });
    });
});
