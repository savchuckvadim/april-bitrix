import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { EventReportFlowResult } from '@workspace/event-sales-flow';
import type { Portal } from '@workspace/pbx';

import type { EvFlowDto } from '@/modules/processes/event/model';

import { getDeliveryTargets } from '../lib/delivery-targets';
import {
    buildDirectDefaultDeferredTail,
    type DirectDeliveryDeps,
} from '../lib/direct-delivery';
import { OUTBOX_ENVELOPE_STATE } from '../lib/outbox-envelope';
import { readOutboxEnvelope } from '../lib/outbox-store';
import {
    TEST_DOMAIN,
    makeClock,
    makeEnvelope,
    makeThunkHarness,
    mountDefaultKvWindow,
    mountKvWindow,
} from '../lib/outbox-test-kit';
import { resolveOutboxNotice } from '../lib/outbox-notice';
import { deliverEnvelopeDirect } from './DirectDeliveryThunk';
import { outboxActions } from './OutboxSlice';
import { drainOutbox } from './OutboxDrainThunk';
import { enqueueAndDeliver } from './OutboxThunk';

/**
 * Полный сценарий врезки А4 на РЕАЛЬНОМ реестре целей: primary трижды
 * падает сетью (мокнутый HTTP FlowHelper), движок выходит на фолбэк-пас,
 * прямой исполнитель проходит настоящий допуск (checkStatus — тем же
 * мокнутым HTTP, сетевой отказ) и исполняет ядро фейковым транспортом
 * пакета — конверт закрывается partial, бейдж честно говорит «ждёт
 * досылки». Подменены только внешние миры: HTTP и сам пакет (execute),
 * плюс слепок портала и комментарии задачи — допуск, маркер-проверка,
 * реестр, движок и машина конверта настоящие.
 */

const { sendFlowMock, getFlowStatusMock } = vi.hoisted(() => ({
    sendFlowMock: vi.fn(),
    getFlowStatusMock: vi.fn(),
}));

vi.mock('@/modules/processes/event/lib/api/flow-helper', () => ({
    FlowHelper: class {
        sendFlow = (dto: unknown) => sendFlowMock(dto);
        getFlowStatus = (operationId: string, domain: string) =>
            getFlowStatusMock(operationId, domain);
    },
}));

const networkError = () =>
    Object.assign(new Error('backend down'), { isAxiosError: true });

const payloadWithTask = (): EvFlowDto =>
    ({
        domain: TEST_DOMAIN,
        presentation: {},
        currentTask: { id: 77 },
    }) as unknown as EvFlowDto;

const packageResult = (): EventReportFlowResult => ({
    batchResults: [],
    errors: [],
    deferredErrors: [],
    deferred: [
        { kind: 'kpi' },
        {
            kind: 'side-flow',
            flow: 'pres',
            addedTaskId: 71,
            createdPresDealId: null,
        },
    ],
    addedTaskId: 71,
});

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mountDefaultKvWindow();
    sendFlowMock.mockReset();
    getFlowStatusMock.mockReset();
});

afterEach(() => {
    vi.restoreAllMocks();
    mountKvWindow(null);
});

describe('врезка А4: primary 3×сеть → direct исполнил ядро → partial + бейдж', () => {
    it('конверт закрыт partial, допуск ходил в статус один раз, бейдж — «ждёт досылки»', async () => {
        // Бэк лежит целиком: и POST /flow, и GET /flow/status — сетевые.
        sendFlowMock.mockRejectedValue(networkError());
        getFlowStatusMock.mockRejectedValue(networkError());

        const { dispatch, actions } = makeThunkHarness();
        const executeCalls: unknown[] = [];
        const overrides: Partial<DirectDeliveryDeps> = {
            // Фейки внешних миров прямого пути: слепок портала, комментарии
            // задачи (маркера нет) и сам пакет (фейковый транспорт).
            ensurePortal: async () => ({
                snapshot: { bitrixDeal: null } as unknown as Portal,
                savedAt: 42_000,
                refreshed: false,
            }),
            readTaskComments: async () => [],
            loadSettings: async () => ({}),
            execute: async input => {
                executeCalls.push(input.settings.directMarker);
                return packageResult();
            },
            log: () => undefined,
        };
        // Реальный реестр: настоящий primaryBackendTarget (мокнут только
        // HTTP) + настоящая цель direct-bitrix поверх настоящего thunk'а.
        const targets = getDeliveryTargets({
            deliverDirect: envelope =>
                dispatch(deliverEnvelopeDirect(envelope, overrides)),
        });
        const { now, wait, delays } = makeClock();
        const envelope = makeEnvelope({ payload: payloadWithTask() });

        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: { targets, now, wait, tabId: 'tab-a', locks: null },
            }),
        );

        expect(summary).toMatchObject({
            status: 'executed-direct',
            envelopeState: OUTBOX_ENVELOPE_STATE.partial,
            persisted: true,
        });
        // primary честно исчерпал сессию: три POST с паузами 2с и 5с
        expect(sendFlowMock).toHaveBeenCalledTimes(3);
        expect(delays).toEqual([2_000, 5_000]);
        // допуск прямого пути сходил в статус РОВНО один раз; поллинга
        // после исполнения нет — операции на бэке не существует
        expect(getFlowStatusMock).toHaveBeenCalledTimes(1);
        expect(getFlowStatusMock).toHaveBeenCalledWith(
            envelope.operationId,
            TEST_DOMAIN,
        );
        // исполнителю ушёл маркер конверта (доктрина №1)
        expect(executeCalls).toEqual([
            expect.objectContaining({
                taskId: 77,
                text: expect.stringContaining(
                    `[evflow:${envelope.operationId}]`,
                ),
            }),
        ]);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.executedDirect).toBe(true);
        expect(stored?.portalSnapshotAt).toBe(42_000);
        expect(stored?.deferred).toEqual([
            { kind: 'kpi' },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: 71,
                createdPresDealId: null,
            },
        ]);
        expect(stored?.attempts.map(a => `${a.targetId}:${a.outcome}`)).toEqual(
            [
                'primary-backend:network-error',
                'primary-backend:network-error',
                'primary-backend:network-error',
                'direct-bitrix:executed-direct',
            ],
        );

        // зеркало → бейдж: partial честно числится недоставленным
        const mirror = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .at(-1);

        expect(mirror?.payload).toEqual({
            domain: TEST_DOMAIN,
            count: 1,
            partialCount: 1,
            incompleteCount: 0,
        });
        // зеркало → полоска: про partial говорим «ждёт досылки», отправить
        // такой конверт целиком нельзя.
        expect(
            resolveOutboxNotice({
                count: 1,
                partialCount: 1,
                incompleteCount: 0,
                draining: false,
            })?.text,
        ).toBe(
            '1 отчёт ждёт досылки: основная часть проведена, служебная ' +
                '(KPI, движения сделок) уедет сама, как только сервер ответит.',
        );
    });

    it('бэк жив статусом (not-found) — допуск отказывает, конверт остаётся ждать primary', async () => {
        sendFlowMock.mockRejectedValue(networkError());
        // POST падает, но статус-эндпоинт ЖИВ: прямой путь запрещён.
        getFlowStatusMock.mockRejectedValue(
            Object.assign(new Error('HTTP 404'), {
                isAxiosError: true,
                response: { status: 404 },
            }),
        );

        const { dispatch } = makeThunkHarness();
        const execute = vi.fn();
        const targets = getDeliveryTargets({
            deliverDirect: envelope =>
                dispatch(
                    deliverEnvelopeDirect(envelope, {
                        ensurePortal: async () => ({
                            snapshot: {} as unknown as Portal,
                            savedAt: 42_000,
                            refreshed: false,
                        }),
                        readTaskComments: async () => [],
                        loadSettings: async () => ({}),
                        execute,
                        log: () => undefined,
                    }),
                ),
        });
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({ payload: payloadWithTask() });

        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: { targets, now, wait, tabId: 'tab-a', locks: null },
            }),
        );

        // допуск-отказ → unavailable → сессия закрыта как exhausted,
        // без попытки direct и без исполнения
        expect(summary).toMatchObject({ status: 'exhausted' });
        expect(execute).not.toHaveBeenCalled();

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.executedDirect).toBeUndefined();
        expect(stored?.attempts.map(a => a.targetId)).toEqual([
            'primary-backend',
            'primary-backend',
            'primary-backend',
        ]);
    });
});

describe('врезка А4: провал ПОСЛЕ ухода пишущего батча (анти-двойное исполнение)', () => {
    it('конверт помечен directAttempted; ожившему бэку исходный payload не уезжает, хвост восстановлен маркером', async () => {
        sendFlowMock.mockRejectedValue(networkError());
        getFlowStatusMock.mockRejectedValue(networkError());

        const { dispatch } = makeThunkHarness();
        // Пишущий батч ушёл в Битрикс, ответ потерян (сеть/смерть вкладки).
        const markerSeen = { found: false };
        const overrides: Partial<DirectDeliveryDeps> = {
            ensurePortal: async () => ({
                snapshot: { bitrixDeal: null } as unknown as Portal,
                savedAt: 42_000,
                refreshed: false,
            }),
            readTaskComments: async () =>
                markerSeen.found
                    ? [{ POST_MESSAGE: `[evflow:${envelope.operationId}]` }]
                    : [],
            loadSettings: async () => ({}),
            execute: async () => {
                markerSeen.found = true; // батч ушёл — маркер в задаче есть

                throw new Error('ответ пишущего батча потерян');
            },
            log: () => undefined,
        };
        const targets = getDeliveryTargets({
            deliverDirect: env =>
                dispatch(deliverEnvelopeDirect(env, overrides)),
        });
        const { now, wait, clock } = makeClock();
        const envelope = makeEnvelope({ payload: payloadWithTask() });

        const first = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: { targets, now, wait, tabId: 'tab-a', locks: null },
            }),
        );

        expect(first).toMatchObject({ status: 'exhausted' });

        const afterFail = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        // След прямой попытки пережил запись исхода из памяти.
        expect(afterFail?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(afterFail?.directAttempted).toMatchObject({ markerTaskId: 77 });

        // Бэк ожил: и POST, и статус отвечают.
        sendFlowMock.mockResolvedValue({ status: 'queued' });
        getFlowStatusMock.mockRejectedValue(
            Object.assign(new Error('HTTP 404'), {
                isAxiosError: true,
                response: { status: 404 },
            }),
        );
        const postsBefore = sendFlowMock.mock.calls.length;

        clock.value += 60_000; // бэкофф отстоял
        await dispatch(
            drainOutbox({
                rearm: false,
                deps: { targets, now, wait, tabId: 'tab-a', locks: null },
            }),
        );

        // Ни одного нового POST исходного payload — иначе бэк исполнил бы
        // отчёт второй раз целиком (вторая план-задача, второй комментарий).
        expect(sendFlowMock.mock.calls.length).toBe(postsBefore);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        // Маркер нашёлся — конверт закрыт как исполненный напрямую, а хвост
        // досылки восстановлен консервативным набором дефолтной карты прав.
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.partial);
        expect(stored?.executedDirect).toBe(true);
        expect(stored?.deferred).toEqual(buildDirectDefaultDeferredTail());
    });
});

describe('врезка А4: прямое исполнение прошло НЕ ЦЕЛИКОМ (MAJOR-2)', () => {
    it('конверт закрыт видимым провалом: failed, состав команд, бейдж его не считает', async () => {
        sendFlowMock.mockRejectedValue(networkError());
        getFlowStatusMock.mockRejectedValue(networkError());

        const { dispatch, actions } = makeThunkHarness();
        const overrides: Partial<DirectDeliveryDeps> = {
            ensurePortal: async () => ({
                snapshot: { bitrixDeal: null } as unknown as Portal,
                savedAt: 42_000,
                refreshed: false,
            }),
            readTaskComments: async () => [],
            loadSettings: async () => ({}),
            // Фреймовый провал: команда обязательной группы осталась без
            // ответа батча (адаптер подставил NO_RESPONSE), плюс упавшая
            // опциональная — та ушла в досылку.
            execute: async () => ({
                ...packageResult(),
                errors: [
                    {
                        cmd: 'complete_task_77',
                        error: {
                            error: 'NO_RESPONSE',
                            error_description: 'команда без ответа батча',
                        },
                    },
                ],
                deferredErrors: [],
            }),
            log: () => undefined,
        };
        const targets = getDeliveryTargets({
            deliverDirect: envelope =>
                dispatch(deliverEnvelopeDirect(envelope, overrides)),
        });
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({ payload: payloadWithTask() });

        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: { targets, now, wait, tabId: 'tab-a', locks: null },
            }),
        );

        expect(summary).toMatchObject({
            status: 'direct-incomplete',
            failedCommands: ['complete_task_77'],
            persisted: true,
        });

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        // Ни delivered, ни partial: конверт не выглядит исполненным.
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.executedDirect).toBe(true);
        expect(stored?.directFailedCommands).toEqual(['complete_task_77']);
        expect(stored?.attempts.at(-1)).toMatchObject({
            targetId: 'direct-bitrix',
            outcome: 'direct-incomplete',
        });

        // «Ждут отправки» на нём врало бы: доставлять его больше некому —
        // конверт идёт отдельным, тревожным счётчиком.
        const mirror = actions
            .filter(a => a.type === outboxActions.setUndelivered.type)
            .at(-1);

        expect(mirror?.payload).toEqual({
            domain: TEST_DOMAIN,
            count: 0,
            partialCount: 0,
            incompleteCount: 1,
        });
        expect(
            resolveOutboxNotice({
                count: 0,
                partialCount: 0,
                incompleteCount: 1,
                draining: false,
            }),
        ).toMatchObject({
            kind: 'incomplete',
            tone: 'warning',
            text:
                '1 отчёт проведён не полностью: сервер был недоступен, и ' +
                'часть изменений применить не удалось. Откройте карточку ' +
                'клиента и сверьте — отправлять заново не нужно.',
        });
    });
});

describe('врезка MINOR-1: 5xx — улика «запрос мог долететь»', () => {
    it('primary ответил 504 — прямой путь не исполняется, конверт ждёт дренажа', async () => {
        // Бэк ставит job ДО исполнения flow: 504 прокси означает «принял».
        // Прямое исполнение стало бы вторым.
        sendFlowMock.mockRejectedValue(
            Object.assign(new Error('gateway timeout'), {
                isAxiosError: true,
                response: { status: 504 },
            }),
        );
        getFlowStatusMock.mockRejectedValue(networkError());

        const { dispatch } = makeThunkHarness();
        const executeCalls: unknown[] = [];
        const overrides: Partial<DirectDeliveryDeps> = {
            ensurePortal: async () => ({
                snapshot: { bitrixDeal: null } as unknown as Portal,
                savedAt: 42_000,
                refreshed: false,
            }),
            readTaskComments: async () => [],
            loadSettings: async () => ({}),
            execute: async input => {
                executeCalls.push(input);
                return packageResult();
            },
            log: () => undefined,
        };
        const targets = getDeliveryTargets({
            deliverDirect: envelope =>
                dispatch(deliverEnvelopeDirect(envelope, overrides)),
        });
        const { now, wait } = makeClock();
        const envelope = makeEnvelope({ payload: payloadWithTask() });

        const summary = await dispatch(
            enqueueAndDeliver(envelope, {
                deps: { targets, now, wait, tabId: 'tab-a', locks: null },
            }),
        );

        expect(summary).toMatchObject({ status: 'exhausted' });
        // Пакет не грузился и в Битрикс никто не писал.
        expect(executeCalls).toEqual([]);

        const stored = await readOutboxEnvelope(
            TEST_DOMAIN,
            envelope.operationId,
        );

        // Конверт остаётся ретраебельным для дренажа: доставит его primary.
        expect(stored?.state).toBe(OUTBOX_ENVELOPE_STATE.failed);
        expect(stored?.attempts.map(a => a.outcome)).toEqual([
            'server-error',
            'server-error',
            'server-error',
        ]);
        expect(stored?.directAttempted).toBeUndefined();
        expect(stored?.executedDirect).toBeUndefined();
    });
});
