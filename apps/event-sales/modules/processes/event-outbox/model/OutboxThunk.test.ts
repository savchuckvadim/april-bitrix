import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getKvStorage } from '@workspace/api';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
    type OutboxEnvelopeState,
} from '../lib/outbox-envelope';
import {
    TEST_DOMAIN,
    makeClock,
    makeEnvelope,
    makeTarget,
    makeThunkHarness,
    mountDefaultKvWindow,
    mountKvWindow,
} from '../lib/outbox-test-kit';
import { readOutboxEnvelope, writeOutboxEnvelope } from '../lib/outbox-store';
import { OUTBOX_DELIVERY_PHASE, outboxActions } from './OutboxSlice';
import {
    enqueueAndDeliver,
    markDelivered,
    markFailed,
    resetOutboxPersistRequestForTests,
} from './OutboxThunk';

/**
 * Конвейер enqueueAndDeliver: конверт пишется awaited ДО первого HTTP (и до
 * финиш-шва onEnqueued), зеркало наполняется, а markDelivered/markFailed
 * гасят конверт по исходу существующего поллинга.
 */

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mountDefaultKvWindow();
    resetOutboxPersistRequestForTests();
});

afterEach(() => {
    vi.restoreAllMocks();
    mountKvWindow(null);
});

const ACCEPTED = {
    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
    operationStatus: 'queued',
} as const;

describe('enqueueAndDeliver', () => {
    it('порядок строго: запись конверта → onEnqueued (финиш) → доставка', async () => {
        const events: string[] = [];
        const envelope = makeEnvelope();
        const storage = await getKvStorage();
        const originalSet = storage.set.bind(storage);

        vi.spyOn(storage, 'set').mockImplementation(async (key, raw) => {
            events.push(`write:${key}`);
            return originalSet(key, raw);
        });

        const { dispatch } = makeThunkHarness();
        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED], { events });
        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                onEnqueued: () => events.push('finish'),
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        expect(summary.status).toBe('accepted');
        // хранилище приняло конверт — итог честно несёт persisted
        expect(summary.persisted).toBe(true);

        const firstWrite = events.findIndex(e => e.startsWith('write:'));
        const finishAt = events.indexOf('finish');
        const deliverAt = events.findIndex(e => e.startsWith('deliver:'));

        // конверт на диске раньше финиша, финиш раньше первого HTTP
        expect(firstWrite).toBe(0);
        expect(finishAt).toBeGreaterThan(firstWrite);
        expect(deliverAt).toBeGreaterThan(finishAt);
    });

    it('зеркало: счётчик недоставленных и стадии текущей отправки', async () => {
        const envelope = makeEnvelope();
        const { dispatch, actions } = makeThunkHarness();
        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED]);

        await dispatch(
            enqueueAndDeliver(envelope, {
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        const phases = actions
            .filter(a => a.type === outboxActions.setCurrentDelivery.type)
            .map(a => (a.payload as { phase: string }).phase);

        expect(phases).toEqual([
            OUTBOX_DELIVERY_PHASE.ENQUEUED,
            OUTBOX_DELIVERY_PHASE.DELIVERING,
            OUTBOX_DELIVERY_PHASE.ACCEPTED,
        ]);

        const counts = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .map(a => (a.payload as { count: number }).count);

        // и после записи, и после accepted конверт ещё не delivered
        expect(counts).toEqual([1, 1]);
    });

    it('rejected: конверт в failed, стадия REJECTED, ретраев нет', async () => {
        const envelope = makeEnvelope();
        const { dispatch, actions } = makeThunkHarness();
        const { now, wait, delays } = makeClock();
        const target = makeTarget([
            { outcome: OUTBOX_DELIVERY_OUTCOME.rejected, detail: 'HTTP 422' },
        ]);
        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        expect(summary).toEqual({
            status: 'rejected',
            detail: 'HTTP 422',
            persisted: true,
        });
        expect(target.calls).toHaveLength(1);
        expect(delays).toEqual([]);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);

        const lastPhase = actions
            .filter(a => a.type === outboxActions.setCurrentDelivery.type)
            .at(-1);

        expect((lastPhase?.payload as { phase: string }).phase).toBe(
            OUTBOX_DELIVERY_PHASE.REJECTED,
        );
    });

    it('хранилища нет: предупреждение, но доставка идёт по памяти', async () => {
        mountKvWindow({}); // kind none

        const envelope = makeEnvelope();
        const { dispatch } = makeThunkHarness();
        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED]);
        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        expect(summary.status).toBe('accepted');
        // конверт в хранилище не лёг — итог обязан этого не скрывать
        expect(summary.persisted).toBe(false);
        expect(target.calls).toHaveLength(1);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('хранилище не приняло конверт'),
            envelope.operationId,
        );
    });

    it('хранилища нет и сеть исчерпана: exhausted честно несёт persisted=false', async () => {
        mountKvWindow({}); // kind none

        const envelope = makeEnvelope();
        const { dispatch } = makeThunkHarness();
        const { now, wait } = makeClock();
        const target = makeTarget([
            { outcome: OUTBOX_DELIVERY_OUTCOME.networkError, detail: 'сеть' },
        ]);
        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        // конверт жил только в памяти: «отправим автоматически» обещать
        // нельзя — по этому флагу интеграция ставит честный ERROR
        expect(summary).toMatchObject({
            status: 'exhausted',
            persisted: false,
        });
        expect(target.calls).toHaveLength(3);
    });

    it('повтор с тем же operationId сливает историю: accepted переживает перезапись', async () => {
        // Первая отправка была принята, но поллинг таймаутнулся — конверт
        // остался delivering с accepted-попыткой, менеджер жмёт «Повторить».
        const first = makeEnvelope({
            createdAt: 500,
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

        await writeOutboxEnvelope(first);

        // Ретрай падает сетью: раньше свежий pending стирал accepted, и после
        // истечения статуса (час) дренаж пере-POST-ил бы уже выполненный flow.
        const retry = makeEnvelope({ operationId: first.operationId });
        const { dispatch } = makeThunkHarness();
        const { now, wait } = makeClock();
        const target = makeTarget([
            { outcome: OUTBOX_DELIVERY_OUTCOME.networkError, detail: 'сеть' },
        ]);

        await dispatch(
            enqueueAndDeliver(retry, {
                deps: {
                    targets: [target],
                    now,
                    wait,
                    tabId: 'tab-a',
                    locks: null,
                },
            }),
        );

        const stored = await readOutboxEnvelope(TEST_DOMAIN, first.operationId);

        // улика на месте: accepted первой отправки + сетевые попытки ретрая
        expect(stored?.attempts[0]).toMatchObject({
            outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
        });
        expect(
            stored?.attempts.filter(
                attempt =>
                    attempt.outcome === OUTBOX_DELIVERY_OUTCOME.networkError,
            ),
        ).toHaveLength(3);
        expect(stored?.createdAt).toBe(500);
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
    });
});

describe('markDelivered / markFailed', () => {
    it('done от поллинга гасит delivering-конверт', async () => {
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-a', until: Date.now() + 60_000 },
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch, actions } = makeThunkHarness();

        await dispatch(markDelivered(envelope.operationId));

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(stored?.lease).toBeUndefined();
        expect(stored?.nextAttemptAt).toBeNull();

        const counts = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .map(a => (a.payload as { count: number }).count);

        expect(counts.at(-1)).toBe(0);
        expect(
            actions.some(
                a => a.type === outboxActions.clearCurrentDelivery.type,
            ),
        ).toBe(true);
    });

    it('done по failed-конверту: статус бэка авторитетен — конверт гасится', async () => {
        // Сверка статуса дренажем может подтвердить done уже ПОСЛЕ того, как
        // конверт упал в failed (ретрай лёг сетью): flow выполнен — гасим,
        // иначе конверт вечно ждал бы досылки, которую слать нельзя.
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markDelivered(envelope.operationId));

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
    });

    it('done по pending-конверту — warn, состояние не трогаем', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markDelivered(envelope.operationId));

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.pending);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('done для конверта в состоянии pending'),
            envelope.operationId,
        );
    });

    it('порченый state в записи: done не бросает — warn и пропуск', async () => {
        // Shape-гард стора пропускает в state любую строку; markDelivered
        // awaited в done-ветке поллинга ДО onDone — TypeError здесь срывал
        // бы cleanEvent/reloadApp успешной отправки.
        const envelope = makeEnvelope({
            state: 'corrupted' as OutboxEnvelopeState,
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await expect(
            dispatch(markDelivered(envelope.operationId)),
        ).resolves.toBeUndefined();

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe('corrupted');
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('done для конверта в состоянии corrupted'),
            envelope.operationId,
        );
    });

    it('failed от бэкенда: rejected-попытка с detail, авторетраев не будет', async () => {
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                },
            ],
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(
            markFailed(envelope.operationId, 'flow упал: нет стадии'),
        );

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.at(-1)).toMatchObject({
            outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
            detail: 'flow упал: нет стадии',
        });
    });

    it('повторный failed — тихий no-op без второй попытки', async () => {
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                    detail: 'первый',
                },
            ],
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markFailed(envelope.operationId, 'второй'));

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.attempts).toHaveLength(1);
    });

    it('конверта нет (сквозное хранилище) — оба маркера молча выходят', async () => {
        const { dispatch } = makeThunkHarness();

        await expect(
            dispatch(markDelivered('op-призрак')),
        ).resolves.toBeUndefined();
        await expect(
            dispatch(markFailed('op-призрак', 'x')),
        ).resolves.toBeUndefined();
    });
});

describe('markDelivered: гард хвоста прямого исполнения', () => {
    it('конверт с executedDirect и непустым deferred в delivered НЕ гасится', async () => {
        // delivered — терминал: погасив partial, мы потеряли бы всю досылку
        // (KPI, движения сделок, элементы смартов) молча.
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.partial,
            executedDirect: true,
            deferred: [{ kind: 'kpi' }, { kind: 'pres-deals' }],
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markDelivered(envelope.operationId));

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.deferred).toEqual([
            { kind: 'kpi' },
            { kind: 'pres-deals' },
        ]);
    });

    it('конверт с executedDirect и ПУСТЫМ хвостом гасится как раньше', async () => {
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.partial,
            executedDirect: true,
            deferred: [],
        });

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markDelivered(envelope.operationId));

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
    });
});
