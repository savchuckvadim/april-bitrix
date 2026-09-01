import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnknownAction } from '@reduxjs/toolkit';

import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_STATE,
} from '@/modules/processes/event-outbox/lib/outbox-envelope';
import {
    readOutboxEnvelope,
    writeOutboxEnvelope,
} from '@/modules/processes/event-outbox/lib/outbox-store';
import {
    TEST_DOMAIN,
    makeEnvelope,
    mountDefaultKvWindow,
    mountKvWindow,
} from '@/modules/processes/event-outbox/lib/outbox-test-kit';
import {
    FLOW_POLL_TIMEOUT_MESSAGE,
    FLOW_POLL_TIMEOUT_MS,
} from '../lib/flow-watch';
import { flowStatusActions } from './FlowStatusSlice';
import { watchFlowOperation } from './FlowWatchThunk';

/**
 * Поллинг статуса гасит конверт outbox: done → delivered, failed от бэка →
 * failed. Таймаут поллинга конверт НЕ трогает: доставка принята, исход
 * неизвестен — с ним позже сверится дренаж (checkStatus).
 */

const { getStatusMock } = vi.hoisted(() => ({ getStatusMock: vi.fn() }));

vi.mock('../lib/api/flow-helper', () => ({
    FlowHelper: class {
        getFlowStatus = (operationId: string, domain: string) =>
            getStatusMock(operationId, domain);
        sendFlow = vi.fn();
    },
}));

const OP = 'op-watch';

const makeHarness = () => {
    const actions: UnknownAction[] = [];
    const state = {
        app: { domain: TEST_DOMAIN },
        flowStatus: { operationId: OP },
    } as unknown as RootState;
    const getState = (() => state) as unknown as AppGetState;
    const dispatch = ((action: unknown) => {
        if (typeof action === 'function') {
            return (action as (d: AppDispatch, g: AppGetState) => unknown)(
                dispatch,
                getState,
            );
        }
        actions.push(action as UnknownAction);

        return action;
    }) as AppDispatch;

    return { dispatch, getState, actions };
};

/** Конверт, ждущий исхода поллинга: delivering с accepted-попыткой. */
const deliveringEnvelope = () =>
    makeEnvelope({
        operationId: OP,
        state: OUTBOX_ENVELOPE_STATE.delivering,
        lease: { tabId: 'tab-a', until: Date.now() + 60_000 },
        attempts: [
            {
                targetId: 'primary-backend',
                at: 1_000,
                outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
            },
        ],
    });

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mountDefaultKvWindow();
    getStatusMock.mockReset();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mountKvWindow(null);
});

describe('watchFlowOperation × outbox', () => {
    it('done: setDone, конверт погашен, onDone после гашения', async () => {
        await writeOutboxEnvelope(deliveringEnvelope());
        getStatusMock.mockResolvedValue({ operationId: OP, status: 'done' });

        const journal: string[] = [];
        const { dispatch, actions } = makeHarness();

        await dispatch(
            watchFlowOperation({
                operationId: OP,
                domain: TEST_DOMAIN,
                tasksStale: true,
                onDone: () => journal.push('onDone'),
            }),
        );

        expect(
            actions.some(a => a.type === flowStatusActions.setDone.type),
        ).toBe(true);
        expect(journal).toEqual(['onDone']);

        const stored = await readOutboxEnvelope(TEST_DOMAIN, OP);

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivered);
        expect(stored?.lease).toBeUndefined();
    });

    it('failed от бэка: setError + конверт failed с деталью, без авторетраев', async () => {
        await writeOutboxEnvelope(deliveringEnvelope());
        getStatusMock.mockResolvedValue({
            operationId: OP,
            status: 'failed',
            error: 'нет стадии сделки',
        });

        const { dispatch, actions } = makeHarness();

        await dispatch(
            watchFlowOperation({
                operationId: OP,
                domain: TEST_DOMAIN,
                tasksStale: true,
            }),
        );

        const error = actions.find(
            a => a.type === flowStatusActions.setError.type,
        );

        expect((error?.payload as { message: string }).message).toBe(
            'нет стадии сделки',
        );

        const stored = await readOutboxEnvelope(TEST_DOMAIN, OP);

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.at(-1)).toMatchObject({
            outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
            detail: 'нет стадии сделки',
        });
    });

    it('таймаут поллинга: setError с подсказкой, но конверт ОСТАЁТСЯ delivering', async () => {
        const envelope = deliveringEnvelope();

        await writeOutboxEnvelope(envelope);
        // статус вечно «в очереди» — терминала поллинг не дождётся
        getStatusMock.mockResolvedValue({ operationId: OP, status: 'queued' });

        vi.useFakeTimers();

        const { dispatch, actions } = makeHarness();
        const run = dispatch(
            watchFlowOperation({
                operationId: OP,
                domain: TEST_DOMAIN,
                tasksStale: true,
            }),
        );

        await vi.advanceTimersByTimeAsync(FLOW_POLL_TIMEOUT_MS + 2_000);
        await run;

        const error = actions.find(
            a => a.type === flowStatusActions.setError.type,
        );

        expect((error?.payload as { message: string }).message).toBe(
            FLOW_POLL_TIMEOUT_MESSAGE,
        );

        const stored = await readOutboxEnvelope(TEST_DOMAIN, OP);

        // конверт не погашен и не зафейлен: исход узнает дренаж checkStatus
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(stored?.attempts).toHaveLength(1);
    });
});
