import { describe, expect, it } from 'vitest';

import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
    OUTBOX_ENVELOPE_VERSION,
    OUTBOX_PACKAGE_VERSION_UNWIRED,
    allowedTransitions,
    applyAttempt,
    applyDirectExecution,
    applyDirectIncomplete,
    canTransition,
    claimEnvelope,
    createOutboxEnvelope,
    hasAcceptedAttempt,
    hasServerRespondedAttempt,
    isRetryableFailure,
    isUndeliveredEnvelope,
    mergeRequeuedEnvelope,
    releaseEnvelopeLease,
    transitionEnvelope,
    type OutboxDeliveryOutcome,
    type OutboxEnvelopeState,
} from './outbox-envelope';
import { makeEnvelope } from './outbox-test-kit';

/**
 * Машина состояний конверта: вся матрица переходов (легальные и нелегальные),
 * применение попыток доставки и производные предикаты. Чистые функции — без
 * хранилища и сети.
 */

const ALL_STATES = Object.values(
    OUTBOX_ENVELOPE_STATE,
) as OutboxEnvelopeState[];

/** Эталонная матрица: какие переходы разрешены. Всё прочее — запрещено. */
const LEGAL: ReadonlyArray<[OutboxEnvelopeState, OutboxEnvelopeState]> = [
    ['pending', 'delivering'],
    ['delivering', 'delivering'],
    ['delivering', 'delivered'],
    ['delivering', 'partial'],
    ['delivering', 'failed'],
    ['partial', 'delivered'],
    ['partial', 'failed'],
    ['failed', 'delivering'],
    // сверка статуса подтвердила done: гасим без повторного POST
    ['failed', 'delivered'],
];

describe('машина переходов конверта', () => {
    it('вся матрица: легальные разрешены, остальные запрещены', () => {
        for (const from of ALL_STATES) {
            for (const to of ALL_STATES) {
                const expected = LEGAL.some(([f, t]) => f === from && t === to);

                expect(canTransition(from, to), `${from} → ${to}`).toBe(
                    expected,
                );
            }
        }
    });

    it('delivered — терминал: из него нет ни одного перехода', () => {
        expect(allowedTransitions[OUTBOX_ENVELOPE_STATE.delivered]).toEqual([]);
    });

    it('transitionEnvelope: легальный переход меняет state и updatedAt', () => {
        const envelope = makeEnvelope();
        const next = transitionEnvelope(
            envelope,
            OUTBOX_ENVELOPE_STATE.delivering,
            2_000,
        );

        expect(next.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(next.updatedAt).toBe(2_000);
        // исходный конверт не мутируется
        expect(envelope.state).toBe(OUTBOX_ENVELOPE_STATE.pending);
    });

    it('canTransition тотальна: state вне enum — false, а не TypeError', () => {
        // Shape-гард стора пропускает любую строку в state, миграция её не
        // нормализует: порченая запись не должна ронять markDelivered/
        // markFailed в done-ветке поллинга.
        const corrupted = 'corrupted' as OutboxEnvelopeState;

        expect(canTransition(corrupted, OUTBOX_ENVELOPE_STATE.delivered)).toBe(
            false,
        );
        expect(canTransition(corrupted, corrupted)).toBe(false);
    });

    it('transitionEnvelope: нелегальный переход бросает', () => {
        const delivered = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.delivered,
        });

        expect(() =>
            transitionEnvelope(
                delivered,
                OUTBOX_ENVELOPE_STATE.delivering,
                2_000,
            ),
        ).toThrow(/запрещённый переход/);
        expect(() =>
            transitionEnvelope(
                makeEnvelope(),
                OUTBOX_ENVELOPE_STATE.delivered,
                2_000,
            ),
        ).toThrow(/запрещённый переход/);
    });
});

describe('applyAttempt', () => {
    const delivering = () =>
        makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.delivering });

    it('accepted: конверт остаётся delivering, попытка записана', () => {
        const next = applyAttempt(
            delivering(),
            {
                targetId: 'primary-backend',
                at: 3_000,
                outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
            },
            null,
        );

        expect(next.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(next.attempts).toHaveLength(1);
        expect(next.attempts[0]!.outcome).toBe('accepted');
        expect(next.nextAttemptAt).toBeNull();
        expect(next.updatedAt).toBe(3_000);
    });

    it('rejected: конверт падает в failed без nextAttemptAt', () => {
        const next = applyAttempt(
            delivering(),
            {
                targetId: 'primary-backend',
                at: 3_000,
                outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                detail: 'HTTP 400',
            },
            null,
        );

        expect(next.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(next.nextAttemptAt).toBeNull();
        expect(isRetryableFailure(next)).toBe(false);
    });

    it('network-error: failed + nextAttemptAt, дренаж вправе ретраить', () => {
        const next = applyAttempt(
            delivering(),
            {
                targetId: 'primary-backend',
                at: 3_000,
                outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
            },
            5_000,
        );

        expect(next.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(next.nextAttemptAt).toBe(5_000);
        expect(isRetryableFailure(next)).toBe(true);
    });

    it('unavailable попыткой не считается — бросает', () => {
        expect(() =>
            applyAttempt(
                delivering(),
                {
                    targetId: 'direct-bitrix',
                    at: 3_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.unavailable,
                },
                null,
            ),
        ).toThrow(/unavailable/);
    });
});

describe('фабрика и вспомогательные предикаты', () => {
    it('createOutboxEnvelope: pending, v текущая, пакет «не подключён»', () => {
        const envelope = createOutboxEnvelope({
            operationId: 'op-x',
            domain: 'demo.bitrix24.ru',
            userId: 42,
            kind: 'nocall',
            payload: { domain: 'demo.bitrix24.ru' } as never,
            now: 10_000,
        });

        expect(envelope).toMatchObject({
            v: OUTBOX_ENVELOPE_VERSION,
            operationId: 'op-x',
            domain: 'demo.bitrix24.ru',
            userId: 42,
            kind: 'nocall',
            state: OUTBOX_ENVELOPE_STATE.pending,
            attempts: [],
            nextAttemptAt: null,
            packageVersion: OUTBOX_PACKAGE_VERSION_UNWIRED,
            createdAt: 10_000,
            updatedAt: 10_000,
        });
    });

    it('claim ставит delivering и lease; release снимает lease', () => {
        const claimed = claimEnvelope(
            makeEnvelope(),
            { tabId: 'tab-a', until: 70_000 },
            10_000,
        );

        expect(claimed.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(claimed.lease).toEqual({ tabId: 'tab-a', until: 70_000 });
        expect(releaseEnvelopeLease(claimed).lease).toBeUndefined();
    });

    it('isUndeliveredEnvelope: pending, delivering и partial ждут доставки', () => {
        expect(isUndeliveredEnvelope(makeEnvelope())).toBe(true);
        expect(
            isUndeliveredEnvelope(
                makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.delivering }),
            ),
        ).toBe(true);
        expect(
            isUndeliveredEnvelope(
                makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.partial }),
            ),
        ).toBe(true);
        expect(
            isUndeliveredEnvelope(
                makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.delivered }),
            ),
        ).toBe(false);
    });

    it('isUndeliveredEnvelope: сетевой failed ждёт дренажа, отвергнутый — терминал', () => {
        const failedWith = (outcome: OutboxDeliveryOutcome) =>
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.failed,
                attempts: [{ targetId: 't', at: 1_000, outcome }],
            });

        // сетевой провал дренаж дошлёт — конверт честно «ждёт отправки»
        expect(
            isUndeliveredEnvelope(
                failedWith(OUTBOX_DELIVERY_OUTCOME.networkError),
            ),
        ).toBe(true);
        // 5xx: сервер отвечал, но исход неизвестен — primary попробует снова
        expect(
            isUndeliveredEnvelope(
                failedWith(OUTBOX_DELIVERY_OUTCOME.serverError),
            ),
        ).toBe(true);
        // отвергнутый (4xx/бизнес-отказ) больше никто не отправит: бейдж
        // «ждут отправки» на нём врал бы, таймер дренажа крутился бы впустую
        expect(
            isUndeliveredEnvelope(failedWith(OUTBOX_DELIVERY_OUTCOME.rejected)),
        ).toBe(false);
        // неполное прямое исполнение — тоже терминал: чинить его нечем
        expect(
            isUndeliveredEnvelope(
                failedWith(OUTBOX_DELIVERY_OUTCOME.directIncomplete),
            ),
        ).toBe(false);
        // failed без попыток — тоже терминал (ретраить нечего)
        expect(
            isUndeliveredEnvelope(
                makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.failed }),
            ),
        ).toBe(false);
    });

    it('hasAcceptedAttempt: замечает accepted в любом месте истории', () => {
        expect(hasAcceptedAttempt(makeEnvelope())).toBe(false);
        expect(
            hasAcceptedAttempt(
                makeEnvelope({
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
                }),
            ),
        ).toBe(true);
    });
});

describe('mergeRequeuedEnvelope: повтор с тем же operationId', () => {
    const accepted = {
        targetId: 'primary-backend',
        at: 1_000,
        outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
    } as const;
    const networkError = {
        targetId: 'primary-backend',
        at: 2_000,
        outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
    } as const;

    it('лежащего конверта нет — свежий уходит как есть', () => {
        const fresh = makeEnvelope();

        expect(mergeRequeuedEnvelope(null, fresh)).toBe(fresh);
    });

    it('история сливается, accepted-улика и createdAt переживают повтор', () => {
        const existing = makeEnvelope({
            createdAt: 500,
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [accepted, networkError],
        });
        const fresh = makeEnvelope({ operationId: existing.operationId });
        const merged = mergeRequeuedEnvelope(existing, fresh);

        expect(merged.attempts).toEqual([accepted, networkError]);
        expect(merged.createdAt).toBe(500);
        // была accepted-попытка — конверт живёт как delivering («POST принят,
        // исход неизвестен»): его дренаж сверит со статусом перед досылкой
        expect(merged.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(merged.nextAttemptAt).toBeNull();
    });

    it('без accepted в истории повтор остаётся свежим pending', () => {
        const existing = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [networkError],
        });
        const fresh = makeEnvelope({ operationId: existing.operationId });
        const merged = mergeRequeuedEnvelope(existing, fresh);

        expect(merged.state).toBe(OUTBOX_ENVELOPE_STATE.pending);
        expect(merged.attempts).toEqual([networkError]);
    });

    it('конверт чужой версии схемы не разбираем — перезапись свежим', () => {
        const foreign = makeEnvelope({ v: 99, attempts: [accepted] });
        const fresh = makeEnvelope({ operationId: foreign.operationId });

        expect(mergeRequeuedEnvelope(foreign, fresh)).toBe(fresh);
    });
});

describe('applyDirectExecution: прямое исполнение (А4)', () => {
    const claimed = () =>
        claimEnvelope(makeEnvelope(), { tabId: 'tab-a', until: 9_000 }, 3_000);

    it('хвоста нет — delivered: попытка executed-direct, lease снят', () => {
        const done = applyDirectExecution(claimed(), {
            targetId: 'direct-bitrix',
            at: 4_000,
            deferred: [],
            portalSnapshotAt: 2_500,
        });

        expect(done.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(done.executedDirect).toBe(true);
        expect(done.deferred).toEqual([]);
        expect(done.attempts).toEqual([
            {
                targetId: 'direct-bitrix',
                at: 4_000,
                outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                detail: undefined,
            },
        ]);
        expect(done.lease).toBeUndefined();
        expect(done.nextAttemptAt).toBeNull();
        expect(done.portalSnapshotAt).toBe(2_500);
        expect(done.updatedAt).toBe(4_000);
    });

    it('с хвостом — partial: deferred сохранён в конверте до досылки (А5)', () => {
        const partial = applyDirectExecution(claimed(), {
            targetId: 'direct-bitrix',
            at: 4_000,
            deferred: [
                { kind: 'kpi' },
                {
                    kind: 'side-flow',
                    flow: 'pres',
                    addedTaskId: 71,
                    createdPresDealId: null,
                },
            ],
            detail: 'тонкий раскрой: kpi',
        });

        expect(partial.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(partial.executedDirect).toBe(true);
        expect(partial.deferred).toEqual([
            { kind: 'kpi' },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: 71,
                createdPresDealId: null,
            },
        ]);
        expect(partial.attempts[0]?.detail).toBe('тонкий раскрой: kpi');
        // partial не кандидат дренажа до А5 — ждать ему нечего
        expect(partial.nextAttemptAt).toBeNull();
        expect(isUndeliveredEnvelope(partial)).toBe(true);
    });

    it('portalSnapshotAt null (возраст неизвестен) — прежнее значение конверта не трогаем', () => {
        const base = claimEnvelope(
            makeEnvelope({ portalSnapshotAt: 1_111 }),
            { tabId: 'tab-a', until: 9_000 },
            3_000,
        );
        const done = applyDirectExecution(base, {
            targetId: 'direct-bitrix',
            at: 4_000,
            deferred: [],
            portalSnapshotAt: null,
        });

        expect(done.portalSnapshotAt).toBe(1_111);
    });

    it('applyAttempt исход executed-direct не принимает — им владеет applyDirectExecution', () => {
        expect(() =>
            applyAttempt(
                claimed(),
                {
                    targetId: 'direct-bitrix',
                    at: 4_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                },
                null,
            ),
        ).toThrow(/executed-direct/);
    });
});

describe('mergeRequeuedEnvelope × executedDirect (запрет А5)', () => {
    it('конверт с прямым исполнением повторный enqueue не сбрасывает в pending', () => {
        const existing = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.partial,
            executedDirect: true,
            deferred: [{ kind: 'kpi' }],
            attempts: [
                {
                    targetId: 'direct-bitrix',
                    at: 4_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                },
            ],
        });
        const fresh = makeEnvelope({ operationId: existing.operationId });

        // primary исполнил бы исходный payload вторым разом — конверт
        // остаётся как есть, хвост доедет своим каналом (А5)
        expect(mergeRequeuedEnvelope(existing, fresh)).toBe(existing);
    });
});

describe('mergeRequeuedEnvelope × directAttempted', () => {
    it('отметка «прямой батч мог уйти» переживает повтор («Повторить»)', () => {
        // Без переноса свежий конверт стёр бы отметку — и дренаж вернул бы
        // конверту primary с исходным payload (двойное исполнение).
        const existing = makeEnvelope({
            state: OUTBOX_ENVELOPE_STATE.failed,
            directAttempted: { at: 4_000, markerTaskId: 3001 },
            attempts: [
                {
                    targetId: 'direct-bitrix',
                    at: 4_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                },
            ],
        });
        const fresh = makeEnvelope({ operationId: existing.operationId });

        const merged = mergeRequeuedEnvelope(existing, fresh);

        expect(merged.directAttempted).toEqual({
            at: 4_000,
            markerTaskId: 3001,
        });
    });
});

describe('applyDirectIncomplete: неполное прямое исполнение (MAJOR-2)', () => {
    const claimed = () =>
        claimEnvelope(makeEnvelope(), { tabId: 'tab-a', until: 9_000 }, 3_000);

    it('конверт закрывается ВИДИМЫМ провалом: failed, состав команд, lease снят', () => {
        const broken = applyDirectIncomplete(claimed(), {
            targetId: 'direct-bitrix',
            at: 4_000,
            failedCommands: ['update_entity_company_431', 'complete_task_9'],
            deferred: [{ kind: 'kpi' }],
            portalSnapshotAt: 2_500,
            detail: 'обязательные команды не применились',
        });

        // Ни delivered, ни partial: отчёт проведён НЕ ЦЕЛИКОМ.
        expect(broken.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(broken.directFailedCommands).toEqual([
            'update_entity_company_431',
            'complete_task_9',
        ]);
        expect(broken.deferred).toEqual([{ kind: 'kpi' }]);
        expect(broken.attempts).toEqual([
            {
                targetId: 'direct-bitrix',
                at: 4_000,
                outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
                detail: 'обязательные команды не применились',
            },
        ]);
        expect(broken.lease).toBeUndefined();
        expect(broken.portalSnapshotAt).toBe(2_500);
        // Авторетраев нет: ни дренаж, ни человек этот конверт не починят.
        expect(broken.nextAttemptAt).toBeNull();
        expect(isRetryableFailure(broken)).toBe(false);
        expect(isUndeliveredEnvelope(broken)).toBe(false);
    });

    it('executedDirect закрывает конверту primary навсегда и гасит повторный enqueue', () => {
        const broken = applyDirectIncomplete(claimed(), {
            targetId: 'direct-bitrix',
            at: 4_000,
            failedCommands: ['complete_task_9'],
            deferred: [],
        });

        // Исходный payload бэку слать нельзя — он исполнил бы отчёт второй раз.
        expect(broken.executedDirect).toBe(true);
        expect(mergeRequeuedEnvelope(broken, makeEnvelope())).toBe(broken);
    });

    it('applyAttempt такой исход не принимает — только applyDirectIncomplete', () => {
        expect(() =>
            applyAttempt(
                claimed(),
                {
                    targetId: 'direct-bitrix',
                    at: 4_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
                },
                null,
            ),
        ).toThrow(/applyDirectIncomplete/);
    });
});

describe('hasServerRespondedAttempt: улика «запрос мог долететь» (MINOR-1)', () => {
    const withAttempt = (outcome: OutboxDeliveryOutcome) =>
        makeEnvelope({
            attempts: [{ targetId: 'primary-backend', at: 1_000, outcome }],
        });

    it('ответ сервера (2xx/4xx/5xx) — улика; молчание сети — нет', () => {
        expect(hasServerRespondedAttempt(makeEnvelope())).toBe(false);
        expect(
            hasServerRespondedAttempt(
                withAttempt(OUTBOX_DELIVERY_OUTCOME.networkError),
            ),
        ).toBe(false);
        expect(
            hasServerRespondedAttempt(
                withAttempt(OUTBOX_DELIVERY_OUTCOME.serverError),
            ),
        ).toBe(true);
        expect(
            hasServerRespondedAttempt(
                withAttempt(OUTBOX_DELIVERY_OUTCOME.accepted),
            ),
        ).toBe(true);
        expect(
            hasServerRespondedAttempt(
                withAttempt(OUTBOX_DELIVERY_OUTCOME.rejected),
            ),
        ).toBe(true);
    });

    it('исходы прямой цели уликой не считаются — HTTP-ответов она не даёт', () => {
        expect(
            hasServerRespondedAttempt(
                withAttempt(OUTBOX_DELIVERY_OUTCOME.executedDirect),
            ),
        ).toBe(false);
        expect(
            hasServerRespondedAttempt(
                withAttempt(OUTBOX_DELIVERY_OUTCOME.directIncomplete),
            ),
        ).toBe(false);
    });
});
