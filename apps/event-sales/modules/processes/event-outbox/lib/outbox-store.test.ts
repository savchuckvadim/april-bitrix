import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getKvStorage } from '@workspace/api';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
    type OutboxEnvelope,
} from './outbox-envelope';
import {
    OUTBOX_DELIVERED_TTL_MS,
    OUTBOX_DOMAIN_CAP,
    buildOutboxKey,
    findOutboxEnvelope,
    listOutboxEnvelopes,
    planOutboxRetention,
    readOutboxEnvelope,
    removeOutboxEnvelope,
    writeOutboxEnvelope,
} from './outbox-store';
import {
    TEST_DOMAIN,
    makeEnvelope,
    mountDefaultKvWindow,
    mountKvWindow,
} from './outbox-test-kit';

/**
 * Стор конвертов поверх реальной цепочки kv-storage (фейковый IndexedDB):
 * формат ключа, изоляция доменов, выживание мусора и незнакомых версий
 * схемы, план уборки.
 */

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mountDefaultKvWindow();
});

afterEach(() => {
    vi.restoreAllMocks();
    mountKvWindow(null);
});

describe('CRUD конвертов', () => {
    it('пишет под ключом evob:{domain}:{operationId} и читает обратно', async () => {
        const envelope = makeEnvelope();

        await expect(writeOutboxEnvelope(envelope)).resolves.toBe(true);

        const storage = await getKvStorage();
        const raw = await storage.get(
            buildOutboxKey(TEST_DOMAIN, envelope.operationId),
        );

        expect(raw).not.toBeNull();
        await expect(
            readOutboxEnvelope(TEST_DOMAIN, envelope.operationId),
        ).resolves.toEqual(envelope);
    });

    it('remove удаляет; чтение несуществующего — null', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);
        await removeOutboxEnvelope(TEST_DOMAIN, envelope.operationId);

        await expect(
            readOutboxEnvelope(TEST_DOMAIN, envelope.operationId),
        ).resolves.toBeNull();
    });

    it('список видит только конверты своего домена', async () => {
        const own = makeEnvelope();
        const foreign = makeEnvelope({ domain: 'other.bitrix24.ru' });

        await writeOutboxEnvelope(own);
        await writeOutboxEnvelope(foreign);

        const listed = await listOutboxEnvelopes(TEST_DOMAIN);

        expect(listed.map(e => e.operationId)).toEqual([own.operationId]);
    });

    it('findOutboxEnvelope находит без домена — сканом ключей', async () => {
        const envelope = makeEnvelope({ domain: 'other.bitrix24.ru' });

        await writeOutboxEnvelope(envelope);

        // подсказка не совпала — скан всё равно нашёл
        const found = await findOutboxEnvelope(
            envelope.operationId,
            TEST_DOMAIN,
        );

        expect(found?.domain).toBe('other.bitrix24.ru');
        await expect(findOutboxEnvelope('op-нет')).resolves.toBeNull();
    });
});

describe('миграция-заглушка при чтении', () => {
    it('битый JSON и не-конверт пропускаются без выброса', async () => {
        const storage = await getKvStorage();

        await storage.set(buildOutboxKey(TEST_DOMAIN, 'op-мусор'), '{оборвано');
        await storage.set(
            buildOutboxKey(TEST_DOMAIN, 'op-чужое'),
            JSON.stringify({ hello: 'world' }),
        );
        const ok = makeEnvelope();

        await writeOutboxEnvelope(ok);

        const listed = await listOutboxEnvelopes(TEST_DOMAIN);

        expect(listed.map(e => e.operationId)).toEqual([ok.operationId]);
    });

    it('незнакомая версия читается как есть — не выброс и не порча', async () => {
        const storage = await getKvStorage();
        const futureRaw = JSON.stringify({
            v: 99,
            operationId: 'op-будущее',
            domain: TEST_DOMAIN,
            state: 'pending',
            someNewField: 'x',
        });

        await storage.set(buildOutboxKey(TEST_DOMAIN, 'op-будущее'), futureRaw);

        const read = await readOutboxEnvelope(TEST_DOMAIN, 'op-будущее');

        expect(read?.v).toBe(99);
        expect(read?.state).toBe('pending');
        // запись на диске не изменилась ни байтом
        await expect(
            storage.get(buildOutboxKey(TEST_DOMAIN, 'op-будущее')),
        ).resolves.toBe(futureRaw);
    });

    it('v1 нормализует необязательные поля (attempts, nextAttemptAt)', async () => {
        const storage = await getKvStorage();

        await storage.set(
            buildOutboxKey(TEST_DOMAIN, 'op-худой'),
            JSON.stringify({
                v: 1,
                operationId: 'op-худой',
                domain: TEST_DOMAIN,
                state: 'pending',
            }),
        );

        const read = await readOutboxEnvelope(TEST_DOMAIN, 'op-худой');

        expect(read?.attempts).toEqual([]);
        expect(read?.nextAttemptAt).toBeNull();
    });
});

describe('planOutboxRetention: уборка и кап', () => {
    const now = 1_000_000_000;

    /** Терминально-отвергнутый failed: последняя попытка — rejected. */
    const rejectedFailed = (overrides: Partial<OutboxEnvelope> = {}) =>
        makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                },
            ],
            ...overrides,
        });

    /** Сетевой failed: дренаж его ещё дошлёт — удалять нельзя. */
    const networkFailed = (overrides: Partial<OutboxEnvelope> = {}) =>
        makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 't',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
            ...overrides,
        });

    it('delivered старше 24ч уходят, свежие и недоставленные остаются', () => {
        const oldDelivered = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: now - OUTBOX_DELIVERED_TTL_MS,
        });
        const freshDelivered = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: now - OUTBOX_DELIVERED_TTL_MS + 1_000,
        });
        const oldPending = makeEnvelope({
            updatedAt: now - 2 * OUTBOX_DELIVERED_TTL_MS,
        });

        const plan = planOutboxRetention(
            [oldDelivered, freshDelivered, oldPending],
            now,
        );

        expect(plan.removeOperationIds).toEqual([oldDelivered.operationId]);
        expect(plan.overflow).toBe(0);
    });

    it('сверх капа удаляются старейшие delivered, недоставленные — никогда', () => {
        // 30 недоставленных + 25 delivered = 55: кап 50 требует убрать 5
        const undelivered = Array.from({ length: 30 }, () => makeEnvelope());
        const delivered = Array.from({ length: 25 }, (_, i) =>
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.delivered,
                updatedAt: now - 1_000 - i, // свежее TTL, разный возраст
            }),
        );

        const plan = planOutboxRetention([...undelivered, ...delivered], now);

        expect(plan.removeOperationIds).toHaveLength(5);
        // именно 5 СТАРЕЙШИХ delivered (наибольший i — самый старый updatedAt)
        const expectedOldest = delivered
            .slice()
            .sort((a, b) => a.updatedAt - b.updatedAt)
            .slice(0, 5)
            .map(e => e.operationId)
            .sort();

        expect([...plan.removeOperationIds].sort()).toEqual(expectedOldest);
        expect(plan.overflow).toBe(0);
    });

    it('недоставленных больше капа — не удаляем, только overflow', () => {
        const undelivered = Array.from({ length: OUTBOX_DOMAIN_CAP + 3 }, () =>
            makeEnvelope(),
        );

        const plan = planOutboxRetention(undelivered, now);

        expect(plan.removeOperationIds).toEqual([]);
        expect(plan.overflow).toBe(3);
    });

    it('конверты чужой версии не удаляются даже delivered-протухшие', () => {
        const foreignVersion = makeEnvelope({
            v: 99,
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: now - 2 * OUTBOX_DELIVERED_TTL_MS,
        });

        const plan = planOutboxRetention([foreignVersion], now);

        expect(plan.removeOperationIds).toEqual([]);
    });

    it('терминально-отвергнутый failed старше 24ч уходит — бессмертных нет', () => {
        const oldRejected = rejectedFailed({
            updatedAt: now - OUTBOX_DELIVERED_TTL_MS,
        });
        const freshRejected = rejectedFailed({
            updatedAt: now - OUTBOX_DELIVERED_TTL_MS + 1_000,
        });
        // сетевой failed того же возраста ждёт дренажа — не удаляется
        const oldNetwork = networkFailed({
            updatedAt: now - 2 * OUTBOX_DELIVERED_TTL_MS,
        });

        const plan = planOutboxRetention(
            [oldRejected, freshRejected, oldNetwork],
            now,
        );

        expect(plan.removeOperationIds).toEqual([oldRejected.operationId]);
        expect(plan.overflow).toBe(0);
    });

    it('кап: отвергнутые удаляются наравне с delivered, старейшие первыми', () => {
        // 48 pending + 2 rejected + 2 delivered = 52: кап 50 требует убрать 2
        const pending = Array.from({ length: 48 }, () => makeEnvelope());
        const oldestRejected = rejectedFailed({ updatedAt: now - 4_000 });
        const freshRejected = rejectedFailed({ updatedAt: now - 1_000 });
        const oldestDelivered = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: now - 3_000,
        });
        const freshDelivered = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivered,
            updatedAt: now - 2_000,
        });

        const plan = planOutboxRetention(
            [
                ...pending,
                freshRejected,
                oldestDelivered,
                oldestRejected,
                freshDelivered,
            ],
            now,
        );

        // старейшие терминальные независимо от исхода: rejected и delivered
        expect([...plan.removeOperationIds].sort()).toEqual(
            [oldestRejected.operationId, oldestDelivered.operationId].sort(),
        );
        expect(plan.overflow).toBe(0);
    });

    it('сетевой failed не удаляется и сверх капа — только overflow', () => {
        const network = Array.from({ length: OUTBOX_DOMAIN_CAP + 2 }, () =>
            networkFailed({ updatedAt: now - 2 * OUTBOX_DELIVERED_TTL_MS }),
        );

        const plan = planOutboxRetention(network, now);

        expect(plan.removeOperationIds).toEqual([]);
        expect(plan.overflow).toBe(2);
    });
});
