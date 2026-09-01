import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
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
import { drainOutbox, stopOutboxDrainTimer } from './OutboxDrainThunk';
import { markDelivered, markFailed } from './OutboxThunk';

/**
 * ТЕРМИНАЛЬНАЯ СУДЬБА ОТЧЁТА — там, где она РЕАЛЬНО становится известна.
 *
 * РЕГРЕССИЯ (M10 из разбора). `accepted` означает лишь «бэк взял операцию»;
 * настоящий исход приходит позже — поллингом FlowWatch или сверкой статуса в
 * дренаже, и обе дороги ведут в `markDelivered` / `markFailed`. Счётчика там
 * не было НИ ОДНОГО, и следствий было три:
 *
 *  (а) «отчёт реально проведён» не считал никто — то есть ровно та цифра,
 *      которую владелец хочет отделить от «принят и потерялся»;
 *  (б) отказ, о котором бэк сообщил СТАТУСОМ (основной путь: операция
 *      исполняется асинхронно), метрике был не виден — счётчик отвергнутых
 *      врал в сторону «всё хорошо»;
 *  (в) конверты, переставшие двигаться навсегда (`status-expired`), не были
 *      видны ни одним счётчиком — они просто исчезали из внимания.
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
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mountDefaultKvWindow();
    collected.attempts.length = 0;
    collected.outcomes.length = 0;
});

afterEach(() => {
    stopOutboxDrainTimer();
    vi.restoreAllMocks();
    mountKvWindow(null);
});

const ACCEPTED_QUEUED = {
    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
    operationStatus: 'queued',
} as const;

const outcomeNames = (): string[] =>
    collected.outcomes.map(item => item.outcome);

/** Конверт, принятый бэком: исход отдан поллингу — как в проде. */
const acceptedEnvelope = () =>
    makeEnvelope({
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

describe('поллинг статуса приносит исход — и его считают', () => {
    it('markDelivered — «отчёт проведён», ровно один раз на конверт', async () => {
        const envelope = acceptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markDelivered(envelope.operationId));

        expect(outcomeNames()).toEqual(['delivered']);
        expect(collected.outcomes[0]?.domain).toBe(TEST_DOMAIN);

        // Повторный done (вторая вкладка, повторный поллинг, сверка дренажа)
        // конверт не пересчитывает.
        await dispatch(markDelivered(envelope.operationId));
        await dispatch(markDelivered(envelope.operationId));

        expect(outcomeNames()).toEqual(['delivered']);
    });

    it('markFailed — «отвергнут сервером»: асинхронный отказ больше не молчит', async () => {
        const envelope = acceptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markFailed(envelope.operationId, 'бэк сообщил ошибку'));

        expect(outcomeNames()).toEqual(['rejected']);

        await dispatch(markFailed(envelope.operationId, 'он же, повторно'));

        expect(outcomeNames()).toEqual(['rejected']);
    });

    it('исход конверта считается один раз, даже когда его гасят обе дороги', async () => {
        const envelope = acceptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const { dispatch } = makeThunkHarness();

        await dispatch(markDelivered(envelope.operationId));
        // Гонка «поллинг сказал done, дренаж следом принёс failed»: конверт
        // уже терминален, и второй судьбы у отчёта быть не может.
        await dispatch(markFailed(envelope.operationId, 'опоздавший провал'));

        expect(outcomeNames()).toEqual(['delivered']);
    });

    /**
     * Две вкладки одного портала: обе видят конверт в хранилище. Отметка
     * лежит там же, поэтому вторая читает уже посчитанный конверт.
     */
    it('соседняя вкладка пересчитать конверт не может', async () => {
        const envelope = acceptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const tabA = makeThunkHarness();
        const tabB = makeThunkHarness();

        await tabA.dispatch(markDelivered(envelope.operationId));
        await tabB.dispatch(markDelivered(envelope.operationId));

        expect(outcomeNames()).toEqual(['delivered']);
    });
});

describe('дренаж: конверт, переставший двигаться навсегда', () => {
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

    it('статус истёк после accepted — терминальный «застрял», один раз за все прогоны', async () => {
        const envelope = acceptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED_QUEUED], {
            id: 'primary-backend',
            checkStatus: [{ kind: 'not-found' }],
        });

        await drainWith(target, now, wait);

        expect(outcomeNames()).toEqual(['stuck']);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.outcomeCounted).toBe(true);
        // Повторный POST по-прежнему запрещён — поведение не изменилось.
        expect(target.calls).toHaveLength(0);

        // Прогон дренажа повторяется каждую минуту, и конверт остаётся
        // застрявшим навсегда: без отметки счётчик рос бы бесконечно.
        await drainWith(target, now, wait);
        await drainWith(target, now, wait);

        expect(outcomeNames()).toEqual(['stuck']);
    });

    it('сверка статуса не ответила — это ПОПЫТКА, а не судьба', async () => {
        const envelope = acceptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED_QUEUED], {
            id: 'primary-backend',
            checkStatus: [{ kind: 'unavailable' }],
        });

        await drainWith(target, now, wait);

        expect(collected.attempts).toEqual([
            {
                outcome: 'status-unavailable',
                target: 'primary-backend',
                domain: TEST_DOMAIN,
            },
        ]);
        // Бэк вернётся — конверт ещё поедет: терминальным он не стал.
        expect(collected.outcomes).toEqual([]);
    });

    it('сверка принесла done — «проведён», и это единственный исход конверта', async () => {
        const envelope = acceptedEnvelope();

        await writeOutboxEnvelope(envelope);

        const { now, wait } = makeClock();
        const target = makeTarget([ACCEPTED_QUEUED], {
            id: 'primary-backend',
            checkStatus: [{ kind: 'status', operationStatus: 'done' }],
        });

        await drainWith(target, now, wait);

        expect(outcomeNames()).toEqual(['delivered']);
    });
});
