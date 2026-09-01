import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getKvStorage } from '@workspace/api';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
} from './outbox-envelope';
import {
    OUTBOX_BACKOFF_DELAYS_MS,
    deliverOutboxEnvelope,
    getDeliverySkipReason,
} from './outbox-delivery';
import {
    PRIMARY_BACKEND_TARGET_ID,
    type DeliveryTargetResult,
} from './delivery-targets';
import { readOutboxEnvelope, writeOutboxEnvelope } from './outbox-store';
import {
    TEST_DOMAIN,
    makeClock,
    makeEnvelope,
    makeFakeLockManager,
    makeTarget,
    mountDefaultKvWindow,
    mountKvWindow,
} from './outbox-test-kit';

/**
 * Двигатель доставки: клейм пишется до обращения к цели, accepted оставляет
 * delivering, rejected не ретраится, сетевой бэкофф 2с/5с/15с, аренды и лок.
 */

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mountDefaultKvWindow();
});

afterEach(() => {
    vi.restoreAllMocks();
    mountKvWindow(null);
});

const ACCEPTED = {
    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
    operationStatus: 'queued',
} as const;
const REJECTED = {
    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
    detail: 'HTTP 400',
} as const;
const NETWORK = { outcome: OUTBOX_DELIVERY_OUTCOME.networkError } as const;

describe('deliverOutboxEnvelope', () => {
    it('клейм (delivering + lease) записан ДО вызова цели', async () => {
        const events: string[] = [];
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const storage = await getKvStorage();
        const originalSet = storage.set.bind(storage);

        vi.spyOn(storage, 'set').mockImplementation(async (key, raw) => {
            events.push(`write:${key}`);
            return originalSet(key, raw);
        });

        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED], { events });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toMatchObject({
            status: 'accepted',
            operationStatus: 'queued',
        });
        // первая запись (клейм) строго раньше первого обращения к цели
        expect(events[0]).toContain('write:');
        expect(events.indexOf(`deliver:${envelope.operationId}`)).toBe(1);
    });

    it('accepted: конверт остаётся delivering c живым lease — исход отдаст поллинг', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED]);

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [target],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(stored?.attempts).toHaveLength(1);
        expect(stored?.lease?.tabId).toBe('tab-a');
        expect(stored!.lease!.until).toBeGreaterThan(now());
    });

    it('rejected (4xx): failed, цель вызвана РОВНО один раз, без ретраев', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait, delays } = makeClock();
        const target = makeTarget([REJECTED, ACCEPTED]);
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({ status: 'rejected', detail: 'HTTP 400' });
        expect(target.calls).toHaveLength(1);
        expect(delays).toEqual([]);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.lease).toBeUndefined();
        expect(stored?.nextAttemptAt).toBeNull();
    });

    it('сетевые ошибки: бэкофф 2с/5с, три попытки, хвост ждёт дренажа с +15с', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait, delays } = makeClock();
        const target = makeTarget([NETWORK, NETWORK, NETWORK, ACCEPTED]);
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({ status: 'exhausted' });
        expect(target.calls).toHaveLength(OUTBOX_BACKOFF_DELAYS_MS.length);
        // в сессии подождали только 2с и 5с; 15с — это nextAttemptAt для дренажа
        expect(delays).toEqual([2_000, 5_000]);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.map(a => a.outcome)).toEqual([
            'network-error',
            'network-error',
            'network-error',
        ]);
        expect(stored?.nextAttemptAt).toBe(stored!.attempts[2]!.at + 15_000);
        expect(stored?.lease).toBeUndefined();
    });

    it('сеть ожила на второй попытке — accepted после одного бэкоффа', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait, delays } = makeClock();
        const target = makeTarget([NETWORK, ACCEPTED]);
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary.status).toBe('accepted');
        expect(delays).toEqual([2_000]);
        expect(target.calls).toHaveLength(2);
    });

    it('все цели unavailable: клейм откатывается, попыток нет', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const unavailable = makeTarget([
            { outcome: OUTBOX_DELIVERY_OUTCOME.unavailable },
        ]);
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [unavailable], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({ status: 'skipped', reason: 'no-target' });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.pending);
        expect(stored?.attempts).toEqual([]);
        expect(stored?.lease).toBeUndefined();
    });

    it('чужой живой lease: доставка пропущена, цель не тронута', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-other', until: now() + 30_000 },
        });

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED]);
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-b', locks: null },
        );

        expect(summary).toEqual({ status: 'skipped', reason: 'lease' });
        expect(target.calls).toHaveLength(0);
    });

    it('протухший lease перехватывается другой вкладкой', async () => {
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivering,
            lease: { tabId: 'tab-dead', until: now() - 1 },
        });

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED]);
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-b', locks: null },
        );

        expect(summary.status).toBe('accepted');

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.lease?.tabId).toBe('tab-b');
    });

    it('лок занят: доставка пропущена без обращения к хранилищу цели', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const locks = makeFakeLockManager();

        locks.held.add(`evob:${envelope.operationId}`);

        const target = makeTarget([ACCEPTED]);
        const { now, wait } = makeClock();
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-a', locks },
        );

        expect(summary).toEqual({ status: 'skipped', reason: 'lock' });
        expect(target.calls).toHaveLength(0);
    });

    it('незнакомая версия схемы не доставляется', async () => {
        const envelope = makeEnvelope({ v: 99 });

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([ACCEPTED]);
        const { now, wait } = makeClock();
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({ status: 'skipped', reason: 'version' });
        expect(target.calls).toHaveLength(0);
    });

    it('хранилища нет (kind none): конверт едет по памяти — отправка работает', async () => {
        mountKvWindow({}); // ни indexedDB, ни localStorage

        const envelope = makeEnvelope();
        const target = makeTarget([NETWORK, ACCEPTED]);
        const { now, wait, delays } = makeClock();
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            {
                targets: [target],
                now,
                wait,
                tabId: 'tab-a',
                locks: null,
                fallbackEnvelope: envelope,
            },
        );

        // машина отработала в памяти: бэкофф и accepted как с хранилищем
        expect(summary.status).toBe('accepted');
        expect(delays).toEqual([2_000]);
        expect(target.calls).toHaveLength(2);
    });

    it('без fallback и без записи — skipped missing', async () => {
        const target = makeTarget([ACCEPTED]);
        const { now, wait } = makeClock();
        const summary = await deliverOutboxEnvelope(TEST_DOMAIN, 'op-нет', {
            targets: [target],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        expect(summary).toEqual({ status: 'skipped', reason: 'missing' });
    });
});

describe('getDeliverySkipReason', () => {
    const now = 500_000;

    it('pending всегда доставляем', () => {
        expect(getDeliverySkipReason(makeEnvelope(), now, 'tab-a')).toBeNull();
    });

    it('delivering: живой lease — lease, протухший — можно', () => {
        expect(
            getDeliverySkipReason(
                makeEnvelope({
                    state: OUTBOX_ENVELOPE_STATE.delivering,
                    lease: { tabId: 'x', until: now + 1 },
                }),
                now,
                'tab-a',
            ),
        ).toBe('lease');
        expect(
            getDeliverySkipReason(
                makeEnvelope({
                    state: OUTBOX_ENVELOPE_STATE.delivering,
                    lease: { tabId: 'x', until: now },
                }),
                now,
                'tab-a',
            ),
        ).toBeNull();
    });

    it('failed: сетевой из будущего — backoff, дозревший — можно, отвергнутый — state', () => {
        const networkFailed = (nextAttemptAt: number) =>
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.failed,
                attempts: [
                    {
                        targetId: 't',
                        at: now - 100,
                        outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    },
                ],
                nextAttemptAt,
            });

        expect(
            getDeliverySkipReason(networkFailed(now + 1), now, 'tab-a'),
        ).toBe('backoff');
        expect(
            getDeliverySkipReason(networkFailed(now), now, 'tab-a'),
        ).toBeNull();

        const rejected = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: now - 100,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
            nextAttemptAt: null,
        });

        expect(getDeliverySkipReason(rejected, now, 'tab-a')).toBe('state');
    });

    it('delivered и partial не трогаем', () => {
        expect(
            getDeliverySkipReason(
                makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.delivered }),
                now,
                'tab-a',
            ),
        ).toBe('state');
        expect(
            getDeliverySkipReason(
                makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.partial }),
                now,
                'tab-a',
            ),
        ).toBe('state');
    });
});

describe('прямой исполнитель в движке (А4)', () => {
    const EXECUTED_EMPTY: DeliveryTargetResult = {
        outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
        direct: { deferred: [], portalSnapshotAt: 42_000 },
    };
    const EXECUTED_TAIL: DeliveryTargetResult = {
        outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
        detail: 'тонкий раскрой: kpi',
        direct: {
            deferred: [{ kind: 'kpi' }, { kind: 'xo-deals' }],
            portalSnapshotAt: 42_000,
        },
    };
    const UNAVAILABLE: DeliveryTargetResult = {
        outcome: OUTBOX_DELIVERY_OUTCOME.unavailable,
        detail: 'допуск прямого пути: backend-alive',
    };
    /** Батч ушёл, обязательные команды не применились (MAJOR-2). */
    const INCOMPLETE: DeliveryTargetResult = {
        outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
        detail: 'обязательные команды пишущего батча не применились',
        directAttempted: { at: 100, markerTaskId: 9 },
        directIncomplete: {
            failedCommands: ['update_entity_company_431', 'complete_task_9'],
            deferred: [{ kind: 'kpi' }],
            portalSnapshotAt: 42_000,
        },
    };

    it('успех без хвоста: конверт delivered, попытка executed-direct записана', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget([EXECUTED_EMPTY], { id: 'direct-bitrix' });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [direct], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({
            status: 'executed-direct',
            envelopeState: OUTBOX_ENVELOPE_STATE.delivered,
            deferred: [],
            detail: undefined,
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(stored?.executedDirect).toBe(true);
        expect(stored?.deferred).toEqual([]);
        expect(stored?.portalSnapshotAt).toBe(42_000);
        expect(stored?.attempts.map(a => a.outcome)).toEqual([
            'executed-direct',
        ]);
        expect(stored?.lease).toBeUndefined();
        expect(stored?.nextAttemptAt).toBeNull();
    });

    it('успех с хвостом: конверт partial, deferred сохранён до досылки (А5)', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget([EXECUTED_TAIL], { id: 'direct-bitrix' });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [direct], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({
            status: 'executed-direct',
            envelopeState: OUTBOX_ENVELOPE_STATE.partial,
            deferred: [{ kind: 'kpi' }, { kind: 'xo-deals' }],
            detail: 'тонкий раскрой: kpi',
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.executedDirect).toBe(true);
        expect(stored?.deferred).toEqual([
            { kind: 'kpi' },
            { kind: 'xo-deals' },
        ]);
    });

    it('неполное исполнение первой целью: конверт failed БЕЗ авторетраев, состав команд в конверте', async () => {
        // Батч ушёл, обязательные команды не применились: ни delivered, ни
        // partial — конверт не должен выглядеть исполненным (MAJOR-2).
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget([INCOMPLETE], { id: 'direct-bitrix' });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [direct], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({
            status: 'direct-incomplete',
            failedCommands: ['update_entity_company_431', 'complete_task_9'],
            deferred: [{ kind: 'kpi' }],
            detail: 'обязательные команды пишущего батча не применились',
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.directFailedCommands).toEqual([
            'update_entity_company_431',
            'complete_task_9',
        ]);
        expect(stored?.deferred).toEqual([{ kind: 'kpi' }]);
        expect(stored?.attempts.map(a => a.outcome)).toEqual([
            'direct-incomplete',
        ]);
        expect(stored?.nextAttemptAt).toBeNull();
        expect(stored?.lease).toBeUndefined();
        // Дренаж его не подберёт: чинить нечем (маркер блокирует повтор,
        // бэку исходный payload слать нельзя).
        expect(getDeliverySkipReason(stored!, now(), 'tab-a')).toBe('state');
    });

    it('неполное исполнение на фолбэк-пасе закрывает конверт так же', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const primary = makeTarget([NETWORK], { id: 'primary-backend' });
        const direct = makeTarget([INCOMPLETE], { id: 'direct-bitrix' });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            {
                targets: [primary, direct],
                now,
                wait,
                tabId: 'tab-a',
                locks: null,
            },
        );

        expect(summary).toMatchObject({ status: 'direct-incomplete' });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.executedDirect).toBe(true);
        // Отметка «батч мог уйти» доехала до конверта: primary ему закрыт.
        expect(stored?.directAttempted).toEqual({ at: 100, markerTaskId: 9 });
        expect(stored?.attempts.map(a => a.targetId + ':' + a.outcome)).toEqual(
            [
                'primary-backend:network-error',
                'primary-backend:network-error',
                'primary-backend:network-error',
                'direct-bitrix:direct-incomplete',
            ],
        );
    });

    it('фолбэк-пас: primary 3×сеть → direct исполнил, история попыток полная', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait, delays } = makeClock();
        const primary = makeTarget([NETWORK], { id: 'primary-backend' });
        const direct = makeTarget([EXECUTED_TAIL], { id: 'direct-bitrix' });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            {
                targets: [primary, direct],
                now,
                wait,
                tabId: 'tab-a',
                locks: null,
            },
        );

        expect(summary).toMatchObject({
            status: 'executed-direct',
            envelopeState: OUTBOX_ENVELOPE_STATE.partial,
        });
        // primary исчерпал сессию (2с+5с), direct вызван РОВНО один раз —
        // на фолбэк-пасе, а не на каждой сетевой ошибке
        expect(primary.calls).toHaveLength(OUTBOX_BACKOFF_DELAYS_MS.length);
        expect(direct.calls).toHaveLength(1);
        expect(delays).toEqual([2_000, 5_000]);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.attempts.map(a => a.targetId + ':' + a.outcome)).toEqual(
            [
                'primary-backend:network-error',
                'primary-backend:network-error',
                'primary-backend:network-error',
                'direct-bitrix:executed-direct',
            ],
        );
        expect(stored?.deferred).toEqual([
            { kind: 'kpi' },
            { kind: 'xo-deals' },
        ]);
    });

    it('фолбэк-пас: допуск-отказ direct (unavailable) — exhausted без его попытки, как раньше', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const primary = makeTarget([NETWORK], { id: 'primary-backend' });
        const direct = makeTarget([UNAVAILABLE], { id: 'direct-bitrix' });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            {
                targets: [primary, direct],
                now,
                wait,
                tabId: 'tab-a',
                locks: null,
            },
        );

        expect(summary).toEqual({ status: 'exhausted' });
        expect(direct.calls).toHaveLength(1);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        // семантика primary не изменилась: три сетевые попытки, конверт
        // ждёт дренажа, попытки direct в истории нет
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.map(a => a.targetId)).toEqual([
            'primary-backend',
            'primary-backend',
            'primary-backend',
        ]);
        expect(stored?.lease).toBeUndefined();
        expect(stored?.nextAttemptAt).toBe(stored!.attempts[2]!.at + 15_000);
    });

    it('фолбэк-пас: провал прямого пути — конверт failed-ретраебельный для дренажа', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const primary = makeTarget([NETWORK], { id: 'primary-backend' });
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    detail: 'прямое исполнение упало: читающий батч',
                },
            ],
            { id: 'direct-bitrix' },
        );
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            {
                targets: [primary, direct],
                now,
                wait,
                tabId: 'tab-a',
                locks: null,
            },
        );

        expect(summary).toEqual({ status: 'exhausted' });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.executedDirect).toBeUndefined();
        expect(stored?.attempts.map(a => a.targetId + ':' + a.outcome)).toEqual(
            [
                'primary-backend:network-error',
                'primary-backend:network-error',
                'primary-backend:network-error',
                'direct-bitrix:network-error',
            ],
        );
        // последняя попытка сетевая → дренаж вправе ретраить (primary снова)
        expect(
            getDeliverySkipReason(stored!, stored!.nextAttemptAt! + 1, 'tab-b'),
        ).toBeNull();
        expect(stored?.lease).toBeUndefined();
    });

    it('duplicate-marker дорогой executed-direct: хвост из конверта уезжает в partial', async () => {
        const envelope = makeEnvelope({
            deferred: [{ kind: 'transfer-notify' }],
        });

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    detail: 'duplicate-marker: исполнено напрямую ранее',
                    direct: {
                        deferred: [{ kind: 'transfer-notify' }],
                        portalSnapshotAt: null,
                    },
                },
            ],
            { id: 'direct-bitrix' },
        );
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [direct], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toMatchObject({
            status: 'executed-direct',
            envelopeState: OUTBOX_ENVELOPE_STATE.partial,
            deferred: [{ kind: 'transfer-notify' }],
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.deferred).toEqual([{ kind: 'transfer-notify' }]);
        expect(stored?.executedDirect).toBe(true);
    });
});

describe('отметка directAttempted: primary запрещён, след не теряется', () => {
    /** Конверт, чей прямой пишущий батч МОГ уйти в Битрикс. */
    const attemptedEnvelope = () =>
        makeEnvelope({
            directAttempted: { at: 90_000, markerTaskId: 3001 },
        });

    it('primary не предлагается вовсе — доставку берёт прямая цель', async () => {
        const envelope = attemptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const primary = makeTarget([ACCEPTED], {
            id: PRIMARY_BACKEND_TARGET_ID,
        });
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    direct: {
                        deferred: [{ kind: 'kpi' }],
                        portalSnapshotAt: null,
                    },
                },
            ],
            { id: 'direct-bitrix' },
        );

        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            {
                targets: [primary, direct],
                now,
                wait,
                tabId: 'tab-a',
                locks: null,
            },
        );

        // Исходный payload на бэк не уехал ни разу — иначе оживший бэк
        // исполнил бы отчёт второй раз целиком.
        expect(primary.calls).toEqual([]);
        expect(direct.calls).toHaveLength(1);
        expect(summary).toMatchObject({
            status: 'executed-direct',
            envelopeState: OUTBOX_ENVELOPE_STATE.partial,
        });
    });

    it('исполненный напрямую конверт (executedDirect) primary тоже не получает', async () => {
        const envelope = makeEnvelope({
            executedDirect: true,
            deferred: [{ kind: 'kpi' }],
        });

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const primary = makeTarget([ACCEPTED], {
            id: PRIMARY_BACKEND_TARGET_ID,
        });

        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [primary], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(primary.calls).toEqual([]);
        expect(summary).toEqual({ status: 'skipped', reason: 'no-target' });
    });

    it('провал прямого пути записывает отметку в конверт (память не затирает след)', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    detail: 'прямое исполнение упало: ответ потерян',
                    directAttempted: { at: 90_000, markerTaskId: 3001 },
                },
            ],
            { id: 'direct-bitrix' },
        );

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [direct],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.directAttempted).toEqual({
            at: 90_000,
            markerTaskId: 3001,
        });
    });
});
