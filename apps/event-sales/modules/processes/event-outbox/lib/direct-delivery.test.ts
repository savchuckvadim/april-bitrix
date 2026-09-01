import { describe, expect, it } from 'vitest';

// Типы приезжают декларациями пакета (package.json types → build/*.d.ts),
// рантайм — его исходниками (main); свидетель связки — в конце файла.
import type { EventReportFlowResult } from '@workspace/event-sales-flow';
import type { Portal } from '@workspace/pbx';

import type { EvFlowDto } from '@/modules/processes/event/model';

import { buildDirectFlowSettings } from './direct-capability';
import {
    DIRECT_PORTAL_REFRESH_POLL_MS,
    DIRECT_PORTAL_REFRESH_TIMEOUT_MS,
    buildDirectDefaultDeferredTail,
    buildDirectMarkerTag,
    buildDirectMarkerText,
    ensureFreshPortalSnapshot,
    hasDirectMarker,
    resolveMarkerTaskId,
    runDirectDelivery,
    runWithCmdBatchHygiene,
    type DirectDeliveryDeps,
    type DirectExecuteInput,
    type DirectPortalCacheEntry,
    type DirectPortalSnapshot,
} from './direct-delivery';
import {
    OUTBOX_DELIVERY_OUTCOME,
    type DirectAttemptMark,
} from './outbox-envelope';
import { TEST_DOMAIN, makeClock, makeEnvelope } from './outbox-test-kit';

/**
 * Прямой исполнитель конверта (А4): допуск по доктрине №1, освежение
 * слепка портала, маркер-проверка, карта прав, разбор исхода. Всё — на
 * фейковых deps; состав команд самого батча сторожит пакетная спека
 * execute-event-report-deferred.spec (маркер первой командой, гейт прав).
 */

const OPERATION_ID = 'op-direct-1';
const TASK_ID = 3001;
const USER_ID = 7;

const PORTAL = { bitrixDeal: { bitrixfields: [] } } as unknown as Portal;

const portalSnapshot = (
    overrides: Partial<DirectPortalSnapshot> = {},
): DirectPortalSnapshot => ({
    snapshot: PORTAL,
    savedAt: 111_000,
    refreshed: false,
    ...overrides,
});

/** Payload с задачей события — маркеру есть куда писаться. */
const taskPayload = (): EvFlowDto =>
    ({
        domain: TEST_DOMAIN,
        presentation: {},
        currentTask: { id: TASK_ID },
    }) as unknown as EvFlowDto;

const makeTaskEnvelope = (overrides: Parameters<typeof makeEnvelope>[0] = {}) =>
    makeEnvelope({
        operationId: OPERATION_ID,
        userId: USER_ID,
        payload: taskPayload(),
        ...overrides,
    });

const okResult = (
    overrides: Partial<EventReportFlowResult> = {},
): EventReportFlowResult => ({
    batchResults: [],
    errors: [],
    deferredErrors: [],
    deferred: [
        { kind: 'kpi' },
        {
            kind: 'side-flow',
            flow: 'zpr',
            addedTaskId: 42,
            createdPresDealId: null,
        },
    ],
    addedTaskId: 42,
    ...overrides,
});

const accessDenied = (cmd: string) => ({
    cmd,
    error: { error: 'ACCESS_DENIED', error_description: 'нет прав' },
});

/** Момент, который дефолтные deps подставляют в отметку прямой попытки. */
const MARK_AT = 777_000;

/** Фейковые deps: всё разрешено и успешно, кейсы подменяют своё. */
const makeDeps = (overrides: Partial<DirectDeliveryDeps> = {}) => {
    const seen = {
        checkStatus: 0,
        commentsFor: [] as number[],
        portalCalls: 0,
        execute: [] as DirectExecuteInput[],
        marks: [] as DirectAttemptMark[],
        /** Порядок шагов, где он несёт смысл (отметка строго до записи). */
        order: [] as string[],
    };
    const deps: DirectDeliveryDeps = {
        now: () => MARK_AT,
        markDirectAttempted: async mark => {
            seen.marks.push(mark);
            seen.order.push('mark');
        },
        checkStatus: async () => {
            seen.checkStatus += 1;

            return { kind: 'unavailable' };
        },
        readTaskComments: async taskId => {
            seen.commentsFor.push(taskId);

            return [];
        },
        ensurePortal: async () => {
            seen.portalCalls += 1;

            return portalSnapshot();
        },
        loadSettings: async () => buildDirectFlowSettings(null),
        execute: async input => {
            seen.execute.push(input);
            seen.order.push('execute');

            return okResult();
        },
        log: () => undefined,
        ...overrides,
    };

    return { deps, seen };
};

describe('маркер: тег, текст, поиск, адресат', () => {
    it('тег и текст несут operationId, текст содержит тег', () => {
        expect(buildDirectMarkerTag(OPERATION_ID)).toBe('[evflow:op-direct-1]');
        expect(buildDirectMarkerText(OPERATION_ID)).toContain(
            '[evflow:op-direct-1]',
        );
    });

    it('hasDirectMarker находит тег в POST_MESSAGE и не ловится на чужой', () => {
        const foreign = { POST_MESSAGE: 'просто комментарий [evflow:op-x]' };
        const own = {
            POST_MESSAGE: `исполнено ${buildDirectMarkerTag(OPERATION_ID)}`,
        };

        expect(hasDirectMarker([foreign], OPERATION_ID)).toBe(false);
        expect(hasDirectMarker([foreign, own], OPERATION_ID)).toBe(true);
        expect(hasDirectMarker([{ POST_MESSAGE: 42 }], OPERATION_ID)).toBe(
            false,
        );
    });

    it('resolveMarkerTaskId — id задачи события; без задачи или с мусором — null', () => {
        expect(resolveMarkerTaskId(taskPayload())).toBe(TASK_ID);
        expect(
            resolveMarkerTaskId({
                domain: TEST_DOMAIN,
            } as unknown as EvFlowDto),
        ).toBeNull();
        expect(
            resolveMarkerTaskId({
                currentTask: { id: 'мусор' },
            } as unknown as EvFlowDto),
        ).toBeNull();
    });
});

describe('ensureFreshPortalSnapshot — освежение слепка с порогом и таймаутом', () => {
    const FRESH_PORTAL = { bitrixDeal: null } as unknown as Portal;

    const makePortalDeps = (start: number) => {
        const { now, wait, delays } = makeClock(start);
        const cacheRef = { entry: null as DirectPortalCacheEntry | null };
        const stateRef = { portal: null as Portal | null };
        const kicked = { count: 0 };

        return {
            cacheRef,
            stateRef,
            kicked,
            delays,
            deps: {
                readCached: async () => cacheRef.entry,
                readState: () => stateRef.portal,
                kickRefresh: async () => {
                    kicked.count += 1;
                },
                now,
                wait,
            },
        };
    };

    it('слепок моложе 2 часов — сеть не трогается', async () => {
        const start = 10_000_000;
        const h = makePortalDeps(start);

        h.cacheRef.entry = { value: PORTAL, savedAt: start - 60 * 60 * 1000 };

        const result = await ensureFreshPortalSnapshot(h.deps);

        expect(result).toEqual({
            snapshot: PORTAL,
            savedAt: start - 60 * 60 * 1000,
            refreshed: false,
        });
        expect(h.kicked.count).toBe(0);
        expect(h.delays).toEqual([]);
    });

    it('протухший освежается: пинок + опрос кэша до свежей записи', async () => {
        const start = 10_000_000;
        const h = makePortalDeps(start);
        const staleAt = start - 3 * 60 * 60 * 1000;

        h.cacheRef.entry = { value: PORTAL, savedAt: staleAt };
        // Свежая запись доезжает «фоновой ревалидацией» ко второму опросу
        // (чтение №1 — снимок before, №2 — первый опрос, №3 — второй).
        let reads = 0;
        h.deps.readCached = async () => {
            reads += 1;
            if (reads >= 3) {
                return { value: FRESH_PORTAL, savedAt: start + 100 };
            }

            return { value: PORTAL, savedAt: staleAt };
        };

        const result = await ensureFreshPortalSnapshot(h.deps);

        expect(h.kicked.count).toBe(1);
        expect(result).toEqual({
            snapshot: FRESH_PORTAL,
            savedAt: start + 100,
            refreshed: true,
        });
        // Между опросами — ровно одна пауза шага опроса.
        expect(h.delays).toEqual([DIRECT_PORTAL_REFRESH_POLL_MS]);
    });

    it('освежение не успело за таймаут — работаем на старом, savedAt старый', async () => {
        const start = 10_000_000;
        const h = makePortalDeps(start);
        const staleAt = start - 3 * 60 * 60 * 1000;

        h.cacheRef.entry = { value: PORTAL, savedAt: staleAt };

        const result = await ensureFreshPortalSnapshot(h.deps);

        expect(h.kicked.count).toBe(1);
        expect(result).toEqual({
            snapshot: PORTAL,
            savedAt: staleAt,
            refreshed: false,
        });
        // Опрашивали до дедлайна: таймаут / шаг опроса.
        expect(h.delays).toHaveLength(
            DIRECT_PORTAL_REFRESH_TIMEOUT_MS / DIRECT_PORTAL_REFRESH_POLL_MS,
        );
    });

    it('пинок упал — старый слепок без ожиданий', async () => {
        const start = 10_000_000;
        const h = makePortalDeps(start);
        const staleAt = start - 3 * 60 * 60 * 1000;

        h.cacheRef.entry = { value: PORTAL, savedAt: staleAt };
        h.deps.kickRefresh = async () => {
            throw new Error('сеть умерла');
        };

        const result = await ensureFreshPortalSnapshot(h.deps);

        expect(result).toEqual({
            snapshot: PORTAL,
            savedAt: staleAt,
            refreshed: false,
        });
    });

    it('кэша нет, но слепок в сторе (возраст неизвестен) — берём его, не освежая', async () => {
        const h = makePortalDeps(10_000_000);

        h.stateRef.portal = PORTAL;

        const result = await ensureFreshPortalSnapshot(h.deps);

        expect(result).toEqual({
            snapshot: PORTAL,
            savedAt: null,
            refreshed: false,
        });
        expect(h.kicked.count).toBe(0);
    });

    it('нет нигде: пинок наполняет только стор (сквозное хранилище) — берём из стора', async () => {
        const h = makePortalDeps(10_000_000);

        h.deps.kickRefresh = async () => {
            h.kicked.count += 1;
            h.stateRef.portal = FRESH_PORTAL;
        };

        const result = await ensureFreshPortalSnapshot(h.deps);

        expect(h.kicked.count).toBe(1);
        expect(result).toEqual({
            snapshot: FRESH_PORTAL,
            savedAt: null,
            refreshed: true,
        });
    });

    it('слепка нет ниоткуда и сеть не дала — null', async () => {
        const h = makePortalDeps(10_000_000);

        const result = await ensureFreshPortalSnapshot(h.deps);

        expect(result).toBeNull();
    });
});

describe('runDirectDelivery — допуск по доктрине №1', () => {
    it('accepted в истории — отказ, статус даже не спрашивается', async () => {
        const { deps, seen } = makeDeps();
        const envelope = makeTaskEnvelope({
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1,
                    outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                },
            ],
        });

        const outcome = await runDirectDelivery(envelope, deps);

        expect(outcome).toEqual({
            status: 'refused',
            reason: 'accepted-attempt',
        });
        expect(seen.checkStatus).toBe(0);
        expect(seen.execute).toEqual([]);
    });

    it('5xx в истории — отказ server-responded: запрос МОГ долететь (MINOR-1)', async () => {
        // Бэк ставит job в очередь ДО исполнения flow: 504 от прокси значит
        // «апстрим принял». Прямое исполнение стало бы вторым.
        const { deps, seen } = makeDeps();
        const envelope = makeTaskEnvelope({
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1,
                    outcome: OUTBOX_DELIVERY_OUTCOME.serverError,
                    detail: 'HTTP 504',
                },
            ],
        });

        const outcome = await runDirectDelivery(envelope, deps);

        expect(outcome).toEqual({
            status: 'refused',
            reason: 'server-responded',
        });
        expect(seen.checkStatus).toBe(0);
        expect(seen.execute).toEqual([]);
    });

    it('сетевые ошибки БЕЗ ответа улику не создают — прямой путь идёт', async () => {
        const { deps, seen } = makeDeps();
        const envelope = makeTaskEnvelope({
            attempts: [1, 2, 3].map(at => ({
                targetId: 'primary-backend',
                at,
                outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
            })),
        });

        const outcome = await runDirectDelivery(envelope, deps);

        expect(outcome.status).toBe('executed');
        expect(seen.execute).toHaveLength(1);
    });

    it('конверт с отметкой прямой попытки допуск server-responded не проходит: судит маркер', async () => {
        // Отметка означает «наш батч МОГ уйти» — живой бэк ему не адресат
        // (primary запрещён навсегда), исход решает только маркер-проверка.
        const { deps, seen } = makeDeps();
        const envelope = makeTaskEnvelope({
            directAttempted: { at: 10, markerTaskId: TASK_ID },
            attempts: [
                {
                    targetId: 'primary-backend',
                    at: 1,
                    outcome: OUTBOX_DELIVERY_OUTCOME.serverError,
                },
            ],
        });

        const outcome = await runDirectDelivery(envelope, deps);

        expect(outcome.status).toBe('executed');
        expect(seen.checkStatus).toBe(0);
    });

    it('статус ответил status — бэк жив, отказ', async () => {
        const { deps, seen } = makeDeps({
            checkStatus: async () => ({
                kind: 'status',
                operationStatus: 'pending' as never,
            }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({
            status: 'refused',
            reason: 'backend-alive',
            detail: 'status: status',
        });
        expect(seen.execute).toEqual([]);
    });

    it('статус ответил not-found — бэк ЖИВ, отказ (доктрина №1)', async () => {
        const { deps, seen } = makeDeps({
            checkStatus: async () => ({ kind: 'not-found' }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({
            status: 'refused',
            reason: 'backend-alive',
            detail: 'status: not-found',
        });
        expect(seen.execute).toEqual([]);
    });

    it('статус сетево мёртв + нет accepted — исполнение идёт', async () => {
        const { deps, seen } = makeDeps();

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome.status).toBe('executed');
        expect(seen.checkStatus).toBe(1);
        expect(seen.execute).toHaveLength(1);
    });

    it('в payload нет задачи события — отказ no-marker-task (маркер обязателен)', async () => {
        const { deps, seen } = makeDeps();
        const envelope = makeEnvelope({ operationId: OPERATION_ID });

        const outcome = await runDirectDelivery(envelope, deps);

        expect(outcome).toEqual({
            status: 'refused',
            reason: 'no-marker-task',
        });
        expect(seen.execute).toEqual([]);
    });

    it('слепка портала нет ниоткуда — отказ no-portal', async () => {
        const { deps, seen } = makeDeps({ ensurePortal: async () => null });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({ status: 'refused', reason: 'no-portal' });
        expect(seen.execute).toEqual([]);
    });
});

describe('runDirectDelivery — маркер-проверка', () => {
    it('маркер найден — duplicate-marker без исполнения, хвост deferred из конверта', async () => {
        const { deps, seen } = makeDeps({
            readTaskComments: async () => [
                { POST_MESSAGE: `было: ${buildDirectMarkerTag(OPERATION_ID)}` },
            ],
        });
        const envelope = makeTaskEnvelope({
            deferred: [{ kind: 'kpi' }, { kind: 'transfer-notify' }],
        });

        const outcome = await runDirectDelivery(envelope, deps);

        expect(outcome).toEqual({
            status: 'duplicate-marker',
            executedDirect: true,
            deferred: [{ kind: 'kpi' }, { kind: 'transfer-notify' }],
        });
        expect(seen.execute).toEqual([]);
    });

    it('маркер найден, deferred в конверте пуст — КОНСЕРВАТИВНЫЙ хвост, не пустой', async () => {
        // Конверт, чьё прямое исполнение прошло flush, но не дожило до
        // записи исхода: пустой хвост закрыл бы его терминальным delivered
        // и потерял бы всю досылку молча.
        const { deps } = makeDeps({
            readTaskComments: async () => [
                { POST_MESSAGE: buildDirectMarkerTag(OPERATION_ID) },
            ],
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({
            status: 'duplicate-marker',
            executedDirect: true,
            deferred: buildDirectDefaultDeferredTail(),
        });
        expect(buildDirectDefaultDeferredTail()).toEqual([
            { kind: 'pres-deals' },
            { kind: 'xo-deals' },
            { kind: 'kpi' },
            { kind: 'lead-request-sync' },
            { kind: 'transfer-notify' },
            {
                kind: 'side-flow',
                flow: 'zpr',
                addedTaskId: null,
                createdPresDealId: null,
            },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: null,
                createdPresDealId: null,
            },
        ]);
    });

    it('комментарии не прочитались — отказ marker-unverified, исполнять вслепую нельзя', async () => {
        const { deps, seen } = makeDeps({
            readTaskComments: async () => {
                throw new Error('сеть Битрикса умерла');
            },
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({
            status: 'refused',
            reason: 'marker-unverified',
            detail: 'сеть Битрикса умерла',
        });
        expect(seen.execute).toEqual([]);
    });

    it('маркер не найден — исполнение; комментарии читались у задачи события', async () => {
        const { deps, seen } = makeDeps({
            readTaskComments: async taskId => {
                seen.commentsFor.push(taskId);

                return [{ POST_MESSAGE: 'обычный комментарий' }];
            },
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome.status).toBe('executed');
        expect(seen.commentsFor).toContain(TASK_ID);
    });
});

describe('runDirectDelivery — отметка «пишущий батч МОГ уйти»', () => {
    it('отметка записана ДО execute и уезжает вызывающему вместе с провалом', async () => {
        const { deps, seen } = makeDeps({
            execute: async () => {
                seen.order.push('execute');

                throw new Error('ответ пишущего батча потерян');
            },
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        // Порядок — суть фикса: сбой ПОСЛЕ ухода батча обязан оставить след.
        expect(seen.order).toEqual(['mark', 'execute']);
        expect(seen.marks).toEqual([{ at: MARK_AT, markerTaskId: TASK_ID }]);
        expect(outcome).toEqual({
            status: 'failed',
            detail: 'прямое исполнение упало: ответ пишущего батча потерян',
            directAttempted: { at: MARK_AT, markerTaskId: TASK_ID },
        });
    });

    it('неполное исполнение (провал обязательной команды) тоже несёт отметку', async () => {
        const { deps } = makeDeps({
            execute: async () =>
                okResult({ errors: [accessDenied('complete_task_9')] }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toMatchObject({
            status: 'incomplete',
            directAttempted: { at: MARK_AT, markerTaskId: TASK_ID },
        });
    });

    it('отметку записать не удалось — отказ, в Битрикс не пишем вовсе', async () => {
        const { deps, seen } = makeDeps({
            markDirectAttempted: async () => {
                throw new Error('хранилище отказало');
            },
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({
            status: 'refused',
            reason: 'attempt-unrecorded',
            detail: 'хранилище отказало',
        });
        expect(seen.execute).toEqual([]);
    });

    it('конверт с отметкой: живой бэк не судья — судит маркер (найден → duplicate)', async () => {
        let checks = 0;
        const { deps, seen } = makeDeps({
            checkStatus: async () => {
                checks += 1;

                return { kind: 'status', operationStatus: 'done' as never };
            },
            readTaskComments: async () => [
                { POST_MESSAGE: buildDirectMarkerTag(OPERATION_ID) },
            ],
        });
        const envelope = makeTaskEnvelope({
            directAttempted: { at: 5_000, markerTaskId: TASK_ID },
        });

        const outcome = await runDirectDelivery(envelope, deps);

        // Статус не спрашивается: primary такому конверту запрещён, и
        // «бэк жив» больше не повод оставить его без сверки маркера.
        expect(checks).toBe(0);
        expect(seen.execute).toEqual([]);
        expect(outcome).toEqual({
            status: 'duplicate-marker',
            executedDirect: true,
            deferred: buildDirectDefaultDeferredTail(),
        });
    });

    it('конверт с отметкой, маркера в задаче нет — батч не ушёл, исполняем', async () => {
        let checks = 0;
        const { deps, seen } = makeDeps({
            checkStatus: async () => {
                checks += 1;

                return { kind: 'not-found' };
            },
        });
        const envelope = makeTaskEnvelope({
            directAttempted: { at: 5_000, markerTaskId: TASK_ID },
        });

        const outcome = await runDirectDelivery(envelope, deps);

        expect(checks).toBe(0);
        expect(outcome.status).toBe('executed');
        expect(seen.execute).toHaveLength(1);
    });
});

describe('runDirectDelivery — исполнение и карта прав', () => {
    it('исполнителю уходят дефолтная карта прав и маркер конверта', async () => {
        const { deps, seen } = makeDeps();
        const envelope = makeTaskEnvelope();

        await runDirectDelivery(envelope, deps);

        const input = seen.execute[0]!;

        // Карта прав — дефолты доктрины: все опциональные права выключены
        // (состав команд батча под этой картой сторожит пакетная спека).
        expect(input.settings.capabilities).toEqual({
            allowSmartWrites: false,
            allowKpiWrites: false,
            allowPresDealWrites: false,
            allowXoDealWrites: false,
            allowLeadRequestSync: false,
            allowTransferNotify: false,
        });
        // Маркер: задача события, автор — менеджер конверта, текст с тегом.
        expect(input.settings.directMarker).toEqual({
            taskId: TASK_ID,
            authorId: USER_ID,
            text: buildDirectMarkerText(OPERATION_ID),
        });
        expect(input.payload).toBe(envelope.payload);
    });

    it('успех: наружу deferred, addedTaskId и свежесть слепка (portalSnapshotAt)', async () => {
        const { deps } = makeDeps({
            ensurePortal: async () => portalSnapshot({ savedAt: 555_000 }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({
            status: 'executed',
            executedDirect: true,
            deferred: okResult().deferred,
            addedTaskId: 42,
            portalSnapshotAt: 555_000,
        });
    });

    it('слепок без кэша (возраст неизвестен) — portalSnapshotAt null', async () => {
        const { deps } = makeDeps({
            ensurePortal: async () => portalSnapshot({ savedAt: null }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toMatchObject({
            status: 'executed',
            portalSnapshotAt: null,
        });
    });
});

describe('runDirectDelivery — ошибки исполнения', () => {
    it('исполнитель бросил (читающий батч/сеть) — провал прямого пути', async () => {
        const { deps } = makeDeps({
            execute: async () => {
                throw new Error('flush упал');
            },
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toEqual({
            status: 'failed',
            detail: 'прямое исполнение упало: flush упал',
            // Отметка «батч мог уйти» едет с провалом — см. соседний describe.
            directAttempted: { at: MARK_AT, markerTaskId: TASK_ID },
        });
    });

    it('упала обязательная команда пишущего — incomplete, не полу-исполненное «delivered»', async () => {
        // Батч УШЁЛ (маркер — его первая команда): повторить нечем, бэку
        // отдавать нельзя. Исход терминальный и видимый, с составом
        // неприменившихся команд (MAJOR-2).
        const { deps } = makeDeps({
            execute: async () =>
                okResult({
                    errors: [accessDenied('update_entity_company_431')],
                    deferredErrors: [],
                }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toMatchObject({
            status: 'incomplete',
            executedDirect: true,
            failedCommands: ['update_entity_company_431'],
            directAttempted: { at: MARK_AT, markerTaskId: TASK_ID },
        });
        expect((outcome as { detail: string }).detail).toContain(
            'update_entity_company_431',
        );
        expect((outcome as { detail: string }).detail).toContain(
            'ACCESS_DENIED',
        );
    });

    it('команда БЕЗ ОТВЕТА (фрейм прячет result_error) судится как провал обязательной части', async () => {
        // Единственная форма падения во фрейме: b24jssdk выбрасывает
        // упавшую команду из ответа, адаптер подставляет NO_RESPONSE.
        const { deps } = makeDeps({
            execute: async () =>
                okResult({
                    errors: [
                        {
                            cmd: 'complete_task_9',
                            error: {
                                error: 'NO_RESPONSE',
                                error_description: 'команда без ответа батча',
                            },
                        },
                    ],
                    deferredErrors: [],
                }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toMatchObject({
            status: 'incomplete',
            failedCommands: ['complete_task_9'],
        });
    });

    it('ACCESS_DENIED опциональной группы конвертирован пакетом — успех с хвостом', async () => {
        const converted = accessDenied('set_pres_deal');
        const { deps } = makeDeps({
            execute: async () =>
                okResult({
                    errors: [converted],
                    deferredErrors: [converted],
                    deferred: [{ kind: 'pres-deals' }],
                }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toMatchObject({
            status: 'executed',
            deferred: [{ kind: 'pres-deals' }],
        });
    });

    it('конвертированная и обязательная ошибки вместе — всё равно неполное исполнение', async () => {
        const converted = accessDenied('set_pres_deal');
        const { deps } = makeDeps({
            execute: async () =>
                okResult({
                    errors: [converted, accessDenied('complete_task_9')],
                    deferredErrors: [converted],
                }),
        });

        const outcome = await runDirectDelivery(makeTaskEnvelope(), deps);

        expect(outcome).toMatchObject({
            status: 'incomplete',
            // Конвертированная в досылку в состав провала не входит.
            failedCommands: ['complete_task_9'],
        });
        expect((outcome as { detail: string }).detail).toContain(
            'complete_task_9',
        );
        expect((outcome as { detail: string }).detail).not.toContain(
            'set_pres_deal',
        );
    });
});

describe('runWithCmdBatchHygiene — гигиена общего cmdBatch вокруг исполнителя', () => {
    it('падение между постановкой и flush вычищает СВОИ ключи, чужие живут', async () => {
        const cmdBatch: Record<string, unknown> = {
            foreign_cmd: { method: 'crm.deal.get' },
        };
        const transport = { getCmdBatch: () => cmdBatch };

        await expect(
            runWithCmdBatchHygiene(transport, async () => {
                cmdBatch['evflow_direct_marker'] = {
                    method: 'task.commentitem.add',
                };
                cmdBatch['update_entity_company_1'] = {
                    method: 'crm.company.update',
                };
                throw new Error('queue упал до flush');
            }),
        ).rejects.toThrow('queue упал до flush');

        expect(Object.keys(cmdBatch)).toEqual(['foreign_cmd']);
    });

    it('успех очередь не трогает (flush уже опустошил её сам)', async () => {
        const cmdBatch: Record<string, unknown> = { foreign_cmd: {} };
        const transport = { getCmdBatch: () => cmdBatch };

        const value = await runWithCmdBatchHygiene(transport, async () => {
            cmdBatch['leftover_after_success'] = {};

            return 'ok';
        });

        expect(value).toBe('ok');
        expect(Object.keys(cmdBatch)).toEqual([
            'foreign_cmd',
            'leftover_after_success',
        ]);
    });

    it('транспорт без getCmdBatch (фейк) — гигиена молча выключена', async () => {
        await expect(
            runWithCmdBatchHygiene({}, async () => {
                throw new Error('всё равно пробрасывается');
            }),
        ).rejects.toThrow('всё равно пробрасывается');
    });
});

describe(
    '@workspace/event-sales-flow — рантайм-свидетель',
    { timeout: 20_000 },
    () => {
        it('поверхность use-case живёт в модуле, который грузится в браузере', async () => {
            // tsc приложения видит пакет ДЕКЛАРАЦИЯМИ (build/*.d.ts), а
            // ленивый import() в рантайме — ИСХОДНИКАМИ (main). Декларации
            // рождены из этих же исходников, поэтому разойтись они не могут;
            // свидетель держит вторую половину связки — что модуль реально
            // грузится и отдаёт названную поверхность.
            const real = await import('@workspace/event-sales-flow');

            expect(real.DIRECT_MARKER_CMD).toBe('evflow_direct_marker');
            expect(typeof real.executeEventReportFlow).toBe('function');
            expect(
                real.resolveOptionalGroupDeferredKinds('set_pres_deal'),
            ).toEqual(['pres-deals']);
            expect(
                real.resolveOptionalGroupDeferredKinds(
                    'update_entity_company_1',
                ),
            ).toBeNull();
        });
    },
);
