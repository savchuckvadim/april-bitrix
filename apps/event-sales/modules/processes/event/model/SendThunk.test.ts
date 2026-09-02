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
    makeEnvelope,
    mountDefaultKvWindow,
    mountKvWindow,
} from '@/modules/processes/event-outbox/lib/outbox-test-kit';
import { resetOutboxPersistRequestForTests } from '@/modules/processes/event-outbox/model/OutboxThunk';
import { flowStatusActions } from './FlowStatusSlice';
import { eventActions } from './EventSlice';
import { sendEvent, retrySendEvent } from './SendThunk';

/**
 * Интеграция sendEvent с outbox (план А3): конверт пишется awaited ДО
 * финиша и ДО первого HTTP, финиш уходит до ответа, исходы доставки
 * честно раскладываются по flowStatus, а повтор идёт через outbox с тем же
 * operationId.
 */

// Журнал порядка событий — общий для моков и харнеса.
const { events, sendFlowMock, watchMock, clearDraftMock } = vi.hoisted(() => ({
    events: [] as string[],
    sendFlowMock: vi.fn(),
    watchMock: vi.fn(),
    clearDraftMock: vi.fn(),
}));

// Черновик комментария в localStorage: ловим только его стирание, остальной
// пакет (kv-хранилище outbox) остаётся настоящим.
vi.mock('@workspace/api', async importOriginal => ({
    ...(await importOriginal<typeof import('@workspace/api')>()),
    clearFromLocalStorage: (key: string) => {
        clearDraftMock(key);
        return Promise.resolve();
    },
}));

// Единственный HTTP отправки — мокаем класс, которым пользуется primary-цель.
vi.mock('../lib/api/flow-helper', () => ({
    FlowHelper: class {
        sendFlow = (dto: unknown) => sendFlowMock(dto);
        getFlowStatus = vi.fn();
    },
}));

// Наблюдатель поллинга: sendEvent должен его позвать, сам поллинг не нужен.
vi.mock('./FlowWatchThunk', () => ({
    watchFlowOperation: (options: unknown) => {
        watchMock(options);
        return async () => undefined;
    },
}));

// Payload собирает вся форма — для конвейера хватает домена и operationId.
vi.mock('../lib/build-flow-payload', () => ({
    buildFlowPayload: (
        _state: unknown,
        options: { operationId: string; socketId?: string },
    ) => ({
        domain: 'test.bitrix24.ru',
        operationId: options.operationId,
        plan: { isPlanned: false },
    }),
}));

/** Состояние — только то, что sendEvent реально читает. */
const makeState = (operationId: string | null = null): RootState =>
    ({
        app: {
            domain: TEST_DOMAIN,
            bitrix: {
                user: { ID: '7' },
                company: null,
                deal: null,
                lead: null,
            },
        },
        department: { mode: { current: null } },
        flowStatus: { operationId },
        eventTask: { current: { id: 42 } },
        eventItemMenu: { isActive: false },
    }) as unknown as RootState;

const makeHarness = (operationId: string | null = null) => {
    const actions: UnknownAction[] = [];
    const state = makeState(operationId);
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

const journalStorageWrites = async () => {
    const storage = await getKvStorage();
    const originalSet = storage.set.bind(storage);

    vi.spyOn(storage, 'set').mockImplementation(async (key, raw) => {
        events.push(`write:${key}`);
        return originalSet(key, raw);
    });
};

const NETWORK_ERROR = Object.assign(new Error('Network Error'), {
    isAxiosError: true,
});

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mountDefaultKvWindow();
    resetOutboxPersistRequestForTests();
    events.length = 0;
    sendFlowMock.mockReset();
    watchMock.mockReset();
    clearDraftMock.mockReset();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mountKvWindow(null);
});

describe('sendEvent: порядок конвейера', () => {
    it('конверт пишется awaited ДО финиша, финиш — ДО первого HTTP', async () => {
        await journalStorageWrites();
        sendFlowMock.mockImplementation(
            async (dto: { operationId: string }) => {
                events.push('http');
                return { operationId: dto.operationId, status: 'queued' };
            },
        );

        const { dispatch } = makeHarness();

        await dispatch(sendEvent());

        const firstWrite = events.findIndex(e => e.startsWith('write:evob:'));
        const sendingAt = events.indexOf(
            `action:${flowStatusActions.setSending.type}`,
        );
        const finishAt = events.indexOf(
            `action:${eventActions.setFinishStatus.type}`,
        );
        const httpAt = events.indexOf('http');

        expect(firstWrite).toBeGreaterThanOrEqual(0);
        expect(sendingAt).toBeGreaterThan(firstWrite);
        expect(finishAt).toBeGreaterThan(sendingAt);
        expect(httpAt).toBeGreaterThan(finishAt);
    });

    it('accepted: конверт delivering (kind report), цель записана, поллинг позван', async () => {
        sendFlowMock.mockResolvedValue({ operationId: 'x', status: 'queued' });

        const { dispatch, actions } = makeHarness();

        await dispatch(sendEvent());

        expect(watchMock).toHaveBeenCalledTimes(1);
        const watch = watchMock.mock.calls[0]![0] as {
            operationId: string;
            domain: string;
            tasksStale: boolean;
        };

        expect(watch.domain).toBe(TEST_DOMAIN);
        expect(watch.tasksStale).toBe(true);

        const stored = await readOutboxEnvelope(TEST_DOMAIN, watch.operationId);

        expect(stored?.kind).toBe(OUTBOX_ENVELOPE_KIND.report);
        expect(stored?.userId).toBe(7);
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(stored?.attempts.at(-1)?.outcome).toBe(
            OUTBOX_DELIVERY_OUTCOME.accepted,
        );

        const target = actions.find(
            a => a.type === flowStatusActions.setDeliveryTarget.type,
        );

        expect((target?.payload as { target: string }).target).toBe(
            'primary-backend',
        );
    });

    it('4xx: стадия ERROR без авторетраев, конверт failed, поллинга нет', async () => {
        sendFlowMock.mockRejectedValue(
            Object.assign(new Error('Bad Request'), {
                isAxiosError: true,
                response: { status: 422 },
            }),
        );

        const { dispatch, actions } = makeHarness();

        await dispatch(sendEvent());

        // ровно один POST — битый payload не ретраится
        expect(sendFlowMock).toHaveBeenCalledTimes(1);
        expect(watchMock).not.toHaveBeenCalled();

        const error = actions.find(
            a => a.type === flowStatusActions.setError.type,
        );

        expect((error?.payload as { message: string }).message).toContain(
            'можно повторить',
        );

        const setSending = actions.find(
            a => a.type === flowStatusActions.setSending.type,
        );
        const operationId = (setSending?.payload as { operationId: string })
            .operationId;
        const stored = await readOutboxEnvelope(TEST_DOMAIN, operationId);

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
    });

    it('сеть легла: бэкофф 2с/5с, затем честная стадия «сохранено, отправим автоматически»', async () => {
        // Хранилище выбирается ДО фейковых таймеров: его 3с-таймаут открытия
        // не должен попасть под мок.
        await getKvStorage();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        sendFlowMock.mockRejectedValue(NETWORK_ERROR);

        const { dispatch, actions } = makeHarness();
        const run = dispatch(sendEvent());

        // две паузы сессионного бэкоффа: 2с и 5с
        await vi.advanceTimersByTimeAsync(2_000);
        await vi.advanceTimersByTimeAsync(5_000);
        await run;

        expect(sendFlowMock).toHaveBeenCalledTimes(3);
        expect(watchMock).not.toHaveBeenCalled();
        expect(
            actions.some(a => a.type === flowStatusActions.setError.type),
        ).toBe(false);
        expect(
            actions.some(
                a => a.type === flowStatusActions.setOutboxQueued.type,
            ),
        ).toBe(true);

        const setSending = actions.find(
            a => a.type === flowStatusActions.setSending.type,
        );
        const operationId = (setSending?.payload as { operationId: string })
            .operationId;
        const stored = await readOutboxEnvelope(TEST_DOMAIN, operationId);

        // сетевой failed с хвостом +15с — кандидат дренажа
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.at(-1)?.outcome).toBe(
            OUTBOX_DELIVERY_OUTCOME.networkError,
        );
        expect(stored?.nextAttemptAt).not.toBeNull();
    });

    it('хранилище не приняло конверт, сеть легла: честный ERROR вместо «отправим автоматически»', async () => {
        mountKvWindow({}); // kind none: запись конверта уходит в никуда
        vi.useFakeTimers();
        sendFlowMock.mockRejectedValue(NETWORK_ERROR);

        const { dispatch, actions } = makeHarness();
        const run = dispatch(sendEvent());

        await vi.advanceTimersByTimeAsync(2_000);
        await vi.advanceTimersByTimeAsync(5_000);
        await run;

        expect(sendFlowMock).toHaveBeenCalledTimes(3);
        // конверт жил только в памяти и умер бы со вкладкой: «сохранено,
        // отправим автоматически» было бы ложью — отчёт пропал бы молча
        expect(
            actions.some(
                a => a.type === flowStatusActions.setOutboxQueued.type,
            ),
        ).toBe(false);

        const error = actions.find(
            a => a.type === flowStatusActions.setError.type,
        );

        // прежняя честная стадия ERROR: на финише есть «Повторить»
        expect((error?.payload as { message: string }).message).toContain(
            'можно повторить',
        );
    });
});

describe('sendEvent: черновик комментария', () => {
    /*
     * Черновик живёт в localStorage под ключом компании и пользователя — без
     * задачи. Стирать его в cleanEvent мало: очистка идёт по `done` поллинга
     * и пропускается, если менеджер уже открыл другую задачу той же
     * компании, — тогда reloadApp → getSavedComment возвращал отправленный
     * комментарий в форму следующего отчёта.
     */
    it('accepted: черновик стёрт сразу, не дожидаясь done', async () => {
        sendFlowMock.mockResolvedValue({ operationId: 'x', status: 'queued' });

        const { dispatch } = makeHarness();

        await dispatch(sendEvent());

        expect(clearDraftMock).toHaveBeenCalledTimes(1);
        expect(String(clearDraftMock.mock.calls[0]![0])).toContain(
            '_comment',
        );
    });

    it('4xx: черновик остаётся — «Повторить» и перезагрузка не теряют текст', async () => {
        sendFlowMock.mockRejectedValue(
            Object.assign(new Error('Bad Request'), {
                isAxiosError: true,
                response: { status: 422 },
            }),
        );

        const { dispatch } = makeHarness();

        await dispatch(sendEvent());

        expect(clearDraftMock).not.toHaveBeenCalled();
    });
});

describe('retrySendEvent', () => {
    it('повтор идёт через outbox с ТЕМ ЖЕ operationId и перезаписывает конверт', async () => {
        // после провала: конверт лежит failed, flowStatus помнит операцию
        const failed = makeEnvelope({
            operationId: 'op-reuse',
            state: OUTBOX_ENVELOPE_STATE.failed,
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1_000,
                    outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
                    detail: 'HTTP 422',
                },
            ],
        });
        const { writeOutboxEnvelope } = await import(
            '@/modules/processes/event-outbox/lib/outbox-store'
        );

        await writeOutboxEnvelope(failed);

        sendFlowMock.mockResolvedValue({
            operationId: 'op-reuse',
            status: 'queued',
        });

        const { dispatch } = makeHarness('op-reuse');

        await dispatch(retrySendEvent());

        // POST ушёл с прежним id — бэк идемпотентен и не выполнит flow дважды
        expect(sendFlowMock).toHaveBeenCalledTimes(1);
        expect(
            (sendFlowMock.mock.calls[0]![0] as { operationId: string })
                .operationId,
        ).toBe('op-reuse');
        expect(
            (watchMock.mock.calls[0]![0] as { operationId: string })
                .operationId,
        ).toBe('op-reuse');

        // конверт перезаписан свежим и снова в работе
        const stored = await readOutboxEnvelope(TEST_DOMAIN, 'op-reuse');

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.delivering);
        expect(stored?.attempts.at(-1)?.outcome).toBe(
            OUTBOX_DELIVERY_OUTCOME.accepted,
        );
    });
});
