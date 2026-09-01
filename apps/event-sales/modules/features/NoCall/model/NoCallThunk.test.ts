import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnknownAction } from '@reduxjs/toolkit';

import { getKvStorage } from '@workspace/api';

import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
import {
    OUTBOX_DELIVERY_OUTCOME,
    OUTBOX_ENVELOPE_KIND,
    OUTBOX_ENVELOPE_STATE,
} from '@/modules/processes/event-outbox/lib/outbox-envelope';
import { readOutboxEnvelope } from '@/modules/processes/event-outbox/lib/outbox-store';
import {
    TEST_DOMAIN,
    mountDefaultKvWindow,
    mountKvWindow,
} from '@/modules/processes/event-outbox/lib/outbox-test-kit';
import { resetOutboxPersistRequestForTests } from '@/modules/processes/event-outbox/model/OutboxThunk';
import { flowStatusActions } from '@/modules/processes/event/model/FlowStatusSlice';
import { noCallActions } from './NoCallSlice';
import { sendNoCall } from './NoCallThunk';

/**
 * Недозвон едет тем же конвейером outbox, что и отчёт (kind `nocall`):
 * конверт awaited до setSending и до HTTP; принятый или сохранённый конвертом
 * недозвон помечает задачу и закрывает меню, отвергнутый — нет.
 */

const { events, sendFlowMock, watchMock } = vi.hoisted(() => ({
    events: [] as string[],
    sendFlowMock: vi.fn(),
    watchMock: vi.fn(),
}));

vi.mock('@/modules/processes/event/lib/api/flow-helper', () => ({
    FlowHelper: class {
        sendFlow = (dto: unknown) => sendFlowMock(dto);
        getFlowStatus = vi.fn();
    },
}));

vi.mock('@/modules/processes/event/model/FlowWatchThunk', () => ({
    watchFlowOperation: (options: unknown) => {
        watchMock(options);
        return async () => undefined;
    },
}));

vi.mock('@/modules/processes/event/lib/build-flow-payload', () => ({
    buildFlowPayload: (
        _state: unknown,
        options: { operationId: string; isNoCall?: boolean },
    ) => ({
        domain: 'test.bitrix24.ru',
        operationId: options.operationId,
        isNoCall: options.isNoCall,
    }),
}));

// Контактный thunk тянет свой слайс и портал — здесь достаточно заглушки.
vi.mock('@/modules/entities/EventContact/model/EventContactThunk', () => ({
    setCurrentReportContact: () => async () => undefined,
}));

const makeHarness = () => {
    const actions: UnknownAction[] = [];
    const state = {
        app: {
            domain: TEST_DOMAIN,
            bitrix: {
                user: { ID: '7' },
                company: null,
                deal: null,
                lead: null,
            },
        },
        eventTask: { current: { id: 42 }, tasks: null },
    } as unknown as RootState;
    const getState = (() => state) as unknown as AppGetState;
    const dispatch = ((action: unknown) => {
        if (typeof action === 'function') {
            return (action as (d: AppDispatch, g: AppGetState) => unknown)(
                dispatch,
                getState,
            );
        }
        const typed = action as UnknownAction;

        actions.push(typed);
        events.push(`action:${typed.type}`);

        return action;
    }) as AppDispatch;

    return { dispatch, getState, actions };
};

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mountDefaultKvWindow();
    resetOutboxPersistRequestForTests();
    events.length = 0;
    sendFlowMock.mockReset();
    watchMock.mockReset();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mountKvWindow(null);
});

/*
 * Свой запас времени: кейсы идут через НАСТОЯЩУЮ цепочку kv-storage, а у неё
 * таймаут открытия IndexedDB 3с и коммит транзакции макрозадачей. В одиночку
 * файл укладывается в ~3с, но под параллельной нагрузкой полного прогона
 * упирался в дефолтные 5с и ронял соседний кейс каскадом — счёт шёл на
 * миллисекунды, а не на дефект.
 */
describe('sendNoCall × outbox', { timeout: 20_000 }, () => {
    it('конверт (kind nocall) пишется ДО setSending и ДО HTTP', async () => {
        const storage = await getKvStorage();
        const originalSet = storage.set.bind(storage);

        vi.spyOn(storage, 'set').mockImplementation(async (key, raw) => {
            events.push(`write:${key}`);
            return originalSet(key, raw);
        });
        sendFlowMock.mockImplementation(
            async (dto: { operationId: string }) => {
                events.push('http');
                return { operationId: dto.operationId, status: 'queued' };
            },
        );

        const { dispatch } = makeHarness();

        await dispatch(sendNoCall());

        const firstWrite = events.findIndex(e => e.startsWith('write:evob:'));
        const sendingAt = events.indexOf(
            `action:${flowStatusActions.setSending.type}`,
        );
        const httpAt = events.indexOf('http');

        expect(firstWrite).toBeGreaterThanOrEqual(0);
        expect(sendingAt).toBeGreaterThan(firstWrite);
        expect(httpAt).toBeGreaterThan(sendingAt);

        const operationId = (
            sendFlowMock.mock.calls[0]![0] as { operationId: string }
        ).operationId;
        const stored = await readOutboxEnvelope(TEST_DOMAIN, operationId);

        expect(stored?.kind).toBe(OUTBOX_ENVELOPE_KIND.nocall);
        expect((stored?.payload as { isNoCall?: boolean }).isNoCall).toBe(true);
    });

    it('accepted: задача помечена, меню закрыто, поллинг без перезагрузки списка', async () => {
        sendFlowMock.mockResolvedValue({ operationId: 'x', status: 'queued' });

        const { dispatch, actions } = makeHarness();

        await dispatch(sendNoCall());

        const marked = actions.find(
            a => a.type === noCallActions.setSendedTaskId.type,
        );

        expect((marked?.payload as { taskId: number }).taskId).toBe(42);
        expect(
            actions.some(a => a.type === noCallActions.setActiveStatus.type),
        ).toBe(true);
        expect(watchMock).toHaveBeenCalledTimes(1);
        expect(
            (watchMock.mock.calls[0]![0] as { tasksStale: boolean }).tasksStale,
        ).toBe(false);
    });

    it('rejected: ошибка баннером, задача НЕ помечена, меню не трогаем', async () => {
        sendFlowMock.mockRejectedValue(
            Object.assign(new Error('Bad Request'), {
                isAxiosError: true,
                response: { status: 400 },
            }),
        );

        const { dispatch, actions } = makeHarness();

        await dispatch(sendNoCall());

        expect(sendFlowMock).toHaveBeenCalledTimes(1);
        expect(watchMock).not.toHaveBeenCalled();
        expect(
            actions.some(a => a.type === noCallActions.setSendedTaskId.type),
        ).toBe(false);
        expect(
            actions.some(a => a.type === noCallActions.setActiveStatus.type),
        ).toBe(false);

        const error = actions.find(
            a => a.type === flowStatusActions.setError.type,
        );

        expect((error?.payload as { message: string }).message).toContain(
            'Недозвон не отправлен',
        );
    });

    it('сеть легла: недозвон сохранён конвертом, задача помечена, стадия «отправим автоматически»', async () => {
        await getKvStorage(); // выбор хранилища — до фейковых таймеров
        vi.useFakeTimers({ shouldAdvanceTime: true });
        sendFlowMock.mockRejectedValue(
            Object.assign(new Error('Network Error'), { isAxiosError: true }),
        );

        const { dispatch, actions } = makeHarness();
        const run = dispatch(sendNoCall());

        await vi.advanceTimersByTimeAsync(2_000);
        await vi.advanceTimersByTimeAsync(5_000);
        await run;

        expect(sendFlowMock).toHaveBeenCalledTimes(3);
        expect(
            actions.some(a => a.type === noCallActions.setSendedTaskId.type),
        ).toBe(true);
        expect(
            actions.some(
                a => a.type === flowStatusActions.setOutboxQueued.type,
            ),
        ).toBe(true);
        expect(
            actions.some(a => a.type === flowStatusActions.setError.type),
        ).toBe(false);

        const operationId = (
            sendFlowMock.mock.calls[0]![0] as { operationId: string }
        ).operationId;
        const stored = await readOutboxEnvelope(TEST_DOMAIN, operationId);

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.at(-1)?.outcome).toBe(
            OUTBOX_DELIVERY_OUTCOME.networkError,
        );
    });

    it('хранилище не приняло конверт, сеть легла: ошибка, задача НЕ помечена', async () => {
        mountKvWindow({}); // kind none: запись конверта уходит в никуда
        vi.useFakeTimers();
        sendFlowMock.mockRejectedValue(
            Object.assign(new Error('Network Error'), { isAxiosError: true }),
        );

        const { dispatch, actions } = makeHarness();
        const run = dispatch(sendNoCall());

        await vi.advanceTimersByTimeAsync(2_000);
        await vi.advanceTimersByTimeAsync(5_000);
        await run;

        expect(sendFlowMock).toHaveBeenCalledTimes(3);
        // недозвон жил только в памяти вкладки: пометить задачу отправленной
        // и закрыть меню значило бы молча его потерять
        expect(
            actions.some(a => a.type === noCallActions.setSendedTaskId.type),
        ).toBe(false);
        expect(
            actions.some(a => a.type === noCallActions.setActiveStatus.type),
        ).toBe(false);
        expect(
            actions.some(
                a => a.type === flowStatusActions.setOutboxQueued.type,
            ),
        ).toBe(false);

        const error = actions.find(
            a => a.type === flowStatusActions.setError.type,
        );

        expect((error?.payload as { message: string }).message).toContain(
            'Недозвон не отправлен',
        );
    });
});
