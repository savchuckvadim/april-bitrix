import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
} from './outbox-envelope';
import {
    OUTBOX_BACKOFF_DELAYS_MS,
    deliverOutboxEnvelope,
} from './outbox-delivery';
import { readOutboxEnvelope, writeOutboxEnvelope } from './outbox-store';
import type { DeliveryTargetResult } from './delivery-targets';
import {
    TEST_DOMAIN,
    makeClock,
    makeEnvelope,
    makeTarget,
    mountDefaultKvWindow,
    mountKvWindow,
} from './outbox-test-kit';

/**
 * МЕТРИКИ ДВИЖКА: попытки против судьбы отчёта.
 *
 * РЕГРЕССИЯ (M9 из разбора). Счётчик стоял в `deliverToTarget`, назывался
 * «судьбой отчёта» и считал КАЖДОЕ обращение к цели. Один отчёт при молчащем
 * бэке давал network-error×3 плюс фолбэк-пас, а дренаж повторял то же самое
 * каждую минуту — пять застрявших отчётов рисовали под тысячу инкрементов в
 * час. Владелец, деливший `accepted` на сумму исходов, получал не долю
 * доставленных, а частоту ретраев: чем хуже дела, тем лучше выглядел график.
 *
 * РЕГРЕССИЯ (M10 из разбора). Терминального исхода не было вовсе: `accepted`
 * означает лишь «бэк взял операцию», а «отчёт реально проведён» не считал
 * никто. Теперь конверт получает РОВНО ОДИН терминальный исход за жизнь, и
 * отметка о нём живёт в самом конверте.
 *
 * Тестов на количество вызовов счётчика за полную сессию бэкоффа раньше не
 * было вовсе — именно поэтому подмена смысла и прошла незамеченной.
 */

const collected = vi.hoisted(() => ({
    attempts: [] as Array<{ outcome: string; target: string }>,
    outcomes: [] as Array<{ outcome: string; domain?: string | null }>,
}));

vi.mock('@/modules/shared/metrics/lib/business-metrics', () => ({
    countDeliveryAttempt: (params: { outcome: string; target: string }) => {
        collected.attempts.push(params);
    },
    countReportOutcome: (params: { outcome: string; domain?: string }) => {
        collected.outcomes.push(params);
    },
    countSend: () => undefined,
    countHiddenChecklistQuestion: () => undefined,
    observeBootPhase: () => undefined,
    observeBootToTasks: () => undefined,
    publishOutboxLevel: () => undefined,
}));

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mountDefaultKvWindow();
    collected.attempts.length = 0;
    collected.outcomes.length = 0;
});

afterEach(() => {
    vi.restoreAllMocks();
    mountKvWindow(null);
});

const NETWORK = { outcome: OUTBOX_DELIVERY_OUTCOME.networkError } as const;
const REJECTED = {
    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
    detail: 'HTTP 400',
} as const;
/** Прямое исполнение БЕЗ хвоста — конверт закрывается целиком. */
const executedDirect = (): DeliveryTargetResult => ({
    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
    direct: { deferred: [], portalSnapshotAt: 1_000 },
});

const outcomeNames = (): string[] =>
    collected.outcomes.map(item => item.outcome);

describe('попытки доставки считаются каждая — это частота, а не судьба', () => {
    it('полная сессия бэкоффа: три сетевые попытки — три инкремента и НИ ОДНОГО исхода', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const target = makeTarget([NETWORK], { id: 'primary-backend' });
        const summary = await deliverOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
            { targets: [target], now, wait, tabId: 'tab-a', locks: null },
        );

        expect(summary).toEqual({ status: 'exhausted' });
        // Ровно столько, сколько пауз бэкоффа: движок стучится трижды.
        expect(target.calls).toHaveLength(OUTBOX_BACKOFF_DELAYS_MS.length);
        expect(collected.attempts).toHaveLength(
            OUTBOX_BACKOFF_DELAYS_MS.length,
        );
        expect(
            collected.attempts.every(a => a.outcome === 'network-error'),
        ).toBe(true);
        // ГЛАВНОЕ: судьба отчёта не решена — конверт лежит и ждёт дренажа.
        expect(collected.outcomes).toEqual([]);
    });

    it('дренаж повторяет сессию — попытки удваиваются, исход по-прежнему один (ноль)', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const target = makeTarget([NETWORK], { id: 'primary-backend' });
        const first = makeClock();

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [target],
            now: first.now,
            wait: first.wait,
            tabId: 'tab-a',
            locks: null,
        });

        // Следующий прогон дренажа: горизонт бэкоффа прошёл, конверт снова
        // кандидат — и снова стучится трижды.
        const second = makeClock(first.clock.value + 60_000);

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [target],
            now: second.now,
            wait: second.wait,
            tabId: 'tab-a',
            locks: null,
        });

        expect(collected.attempts).toHaveLength(
            OUTBOX_BACKOFF_DELAYS_MS.length * 2,
        );
        // Ровно то, из-за чего доля успеха по счётчику попыток врала:
        // знаменатель вырос вдвое, а отчёт тот же самый и по-прежнему висит.
        expect(collected.outcomes).toEqual([]);
    });

    it('фолбэк-пас — четвёртая ПОПЫТКА и первый терминальный исход', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const primary = makeTarget([NETWORK], { id: 'primary-backend' });
        const direct = makeTarget([executedDirect()], { id: 'direct-bitrix' });
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

        expect(summary).toMatchObject({ status: 'executed-direct' });
        expect(collected.attempts.map(a => a.outcome)).toEqual([
            'network-error',
            'network-error',
            'network-error',
            'executed-direct',
        ]);
        // Один отчёт — одна судьба, при четырёх попытках.
        expect(outcomeNames()).toEqual(['delivered']);
    });
});

describe('терминальный исход — ровно один на конверт', () => {
    it('прямое исполнение с пустым хвостом гасит конверт как «проведён»', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget([executedDirect()], { id: 'direct-bitrix' });

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [direct],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        expect(outcomeNames()).toEqual(['delivered']);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        // Отметка живёт в конверте — её увидит и соседняя вкладка, и
        // следующая сессия, поэтому пересчитать конверт не сможет никто.
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(stored?.outcomeCounted).toBe(true);
    });

    it('прямое исполнение С ХВОСТОМ судьбу ещё не решает — partial ждёт досылки', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    direct: {
                        deferred: [{ kind: 'kpi' }],
                        portalSnapshotAt: 1_000,
                    },
                },
            ] as never,
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

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        // Служебная часть (KPI, движения сделок, элементы смартов) не
        // проведена — записывать это в успех значило бы врать.
        expect(collected.outcomes).toEqual([]);
        expect(stored?.outcomeCounted).toBeUndefined();
    });

    it('отказ цели — «отвергнут», и повторный прогон его не удваивает', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const target = makeTarget([REJECTED], { id: 'primary-backend' });

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [target],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        expect(outcomeNames()).toEqual(['rejected']);

        // Второй прогон: конверт отвергнут, движок его пропускает — но даже
        // дойди дело до записи, отметка в конверте не дала бы пересчитать.
        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [target],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        expect(outcomeNames()).toEqual(['rejected']);
    });

    it('проведён НЕ ЦЕЛИКОМ — отдельный терминальный исход, тоже один', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget(
            [
                {
                    outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
                    directIncomplete: {
                        failedCommands: ['deal.update'],
                        deferred: [],
                        portalSnapshotAt: 1_000,
                    },
                },
            ] as never,
            { id: 'direct-bitrix' },
        );

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [direct],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        expect(outcomeNames()).toEqual(['incomplete']);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.outcomeCounted).toBe(true);
    });

    it('домен портала едет с исходом — разрез по порталам сохраняется', async () => {
        const envelope = makeEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const direct = makeTarget([executedDirect()], { id: 'direct-bitrix' });

        await deliverOutboxEnvelope(TEST_DOMAIN, envelope.operationId, {
            targets: [direct],
            now,
            wait,
            tabId: 'tab-a',
            locks: null,
        });

        expect(collected.outcomes[0]?.domain).toBe(TEST_DOMAIN);
    });
});
