import { describe, expect, it } from 'vitest';

import type { EventReportFlowResult } from '@workspace/event-sales-flow';
import type { Portal } from '@workspace/pbx';

import { runExclusiveBatchSession } from '@/modules/app/lib/utills/bitrix-batch-queue';
import type { EvFlowDto } from '@/modules/processes/event/model';

import type {
    DirectDeliveryDeps,
    DirectPortalSnapshot,
} from '../lib/direct-delivery';
import {
    TEST_DOMAIN,
    makeEnvelope,
    makeThunkHarness,
} from '../lib/outbox-test-kit';
import { deliverEnvelopeDirect } from './DirectDeliveryThunk';

/**
 * Thunk прямого исполнения: сборка deps с оверрайдами и проброс исхода.
 * Сама оркестрация (допуск/маркер/исполнение) — в lib/direct-delivery.test;
 * здесь только клей: оверрайды уважаются, выброс депа не роняет диспатч.
 */

const payloadWithTask = (): EvFlowDto =>
    ({
        domain: TEST_DOMAIN,
        presentation: {},
        currentTask: { id: 77 },
    }) as unknown as EvFlowDto;

const okResult = (): EventReportFlowResult => ({
    batchResults: [],
    errors: [],
    deferredErrors: [],
    deferred: [{ kind: 'kpi' }],
    addedTaskId: null,
});

const portalSnapshot: DirectPortalSnapshot = {
    snapshot: { bitrixDeal: null } as unknown as Portal,
    savedAt: 42_000,
    refreshed: false,
};

const fullDeps = (
    overrides: Partial<DirectDeliveryDeps> = {},
): Partial<DirectDeliveryDeps> => ({
    checkStatus: async () => ({ kind: 'unavailable' }),
    readTaskComments: async () => [],
    ensurePortal: async () => portalSnapshot,
    loadSettings: async () => ({}),
    execute: async () => okResult(),
    log: () => undefined,
    ...overrides,
});

describe('deliverEnvelopeDirect — клей thunk-а', () => {
    it('исход исполнителя уезжает вызывающему как есть', async () => {
        const { dispatch } = makeThunkHarness();
        const envelope = makeEnvelope({
            operationId: 'op-thunk-1',
            payload: payloadWithTask(),
        });

        const outcome = await dispatch(
            deliverEnvelopeDirect(envelope, fullDeps()),
        );

        expect(outcome).toEqual({
            status: 'executed',
            executedDirect: true,
            deferred: [{ kind: 'kpi' }],
            addedTaskId: null,
            portalSnapshotAt: 42_000,
        });
    });

    it('выброс депа (сломанная сверка статуса) — честный failed, не исключение', async () => {
        const { dispatch } = makeThunkHarness();
        const envelope = makeEnvelope({
            operationId: 'op-thunk-2',
            payload: payloadWithTask(),
        });

        const outcome = await dispatch(
            deliverEnvelopeDirect(
                envelope,
                fullDeps({
                    checkStatus: () =>
                        Promise.reject(new Error('checkStatus сломан')),
                }),
            ),
        );

        expect(outcome).toEqual({
            status: 'failed',
            detail: 'прямой путь упал: checkStatus сломан',
        });
    });
});

describe('прямое исполнение под общей очередью батча', () => {
    /**
     * cmdBatch — общее мутируемое поле синглтона @workspace/bitrix, и
     * callBatch() очищает его только ПОСЛЕ await. Прямой исполнитель —
     * пишущий пользователь этого поля: пока его прогон идёт (читающий батч →
     * резолв → пишущий батч → flush), чужая отправка обязана ждать, иначе
     * она унесёт наши команды себе (или наш flush — её ключи).
     */
    it('чужой пользователь очереди ждёт конца прогона deps.execute', async () => {
        const { dispatch } = makeThunkHarness();
        const order: string[] = [];
        let releaseExecute: () => void = () => undefined;
        let executeStarted: () => void = () => undefined;
        const executeInFlight = new Promise<void>(resolve => {
            executeStarted = resolve;
        });
        const executeGate = new Promise<void>(resolve => {
            releaseExecute = resolve;
        });

        const run = dispatch(
            deliverEnvelopeDirect(
                makeEnvelope({
                    operationId: 'op-thunk-queue',
                    payload: payloadWithTask(),
                }),
                fullDeps({
                    execute: async () => {
                        order.push('direct:start');
                        executeStarted();
                        await executeGate;
                        order.push('direct:end');

                        return okResult();
                    },
                }),
            ),
        );

        await executeInFlight;

        const foreign = runExclusiveBatchSession(async () => {
            order.push('foreign:batch');
        });

        // Дать чужому звену все шансы вклиниться, пока прогон держит очередь.
        await Promise.resolve();
        await Promise.resolve();
        expect(order).toEqual(['direct:start']);

        releaseExecute();
        await run;
        await foreign;

        expect(order).toEqual(['direct:start', 'direct:end', 'foreign:batch']);
    });
});
