// Golden-порт бэковой event-report-use-case-batch-seam.spec (запись
// PARTIAL_PORTS в diff-back): use-case стал функцией executeEventReportFlow
// (порты параметрами), фейковый битрикс — dry-run-транспорт порта
// FlowTransport (flush() ≡ callBatchWithConcurrency(1)), «координатор» —
// сборка deferred[] c addedTaskId; jest.mock → vi.mock. Кейсы, фикстуры и
// ассерты стыка — 1:1.
import { executeEventReportFlow } from '../use-cases/execute-event-report.use-case';
import {
    ADD_TASK_CMD,
    parseAddedTaskId,
} from '../services/task/event-report-task-flow.service';
import { findBatchResult } from '../shared/bitrix/prepare-batch-results.util';
import {
    ColdHookBatchGroupBuffer,
    IBitrixBatchResponseResult,
} from '../shared/batch/batch-group-buffer';
import { makeDryRunTransport } from '../use-cases/__tests__/dry-run-flow-transport';
import type { FlowLogger } from '../ports/flow-logger.port';
import type { FlowPortalSource } from '../ports/flow-portal.port';
import type { FlowSettings } from '../ports/flow-settings';
import type { EventSalesFlowDto } from '../dto/event-sale-flow/event-sales-flow.dto';

/**
 * СТЫК «use-case → досылка side-flow»: откуда исполнитель берёт ответ
 * основного батча (в бэковом оригинале — откуда его берёт координатор
 * сайд-очередей; постановку очередей в пакете заменяет сборка deferred[]).
 *
 * КАКУЮ РЕГРЕССИЮ СТЕРЕЖЁТ ЭТОТ ТЕСТ
 * ----------------------------------
 * cmdBatch у инстанса Битрикса ОДИН на весь endpoint, и `buffer.flush()`
 * отправляет его ЦЕЛИКОМ — вместе с командами, которые flow-сервисы положили
 * напрямую в `bitrix.batch.*` (в том числе `add_task`), — после чего очищает
 * очередь. Поэтому хвостовой `bitrix.flush()` в use-case'е работает на УЖЕ
 * пустой очереди и возвращает `[]`: единственный ответ с id созданной
 * план-задачи лежит в `buffer.getResults()`.
 *
 * Пока наружу уезжало `batchResults: results` (только хвостовой вызов),
 * `findBatchResult(..., 'add_task')` не находил ничего НИКОГДА, `planTaskId`
 * был `null`, и плановый элемент смарта уходил в очередь без привязки к
 * задаче. Фича была мертва целиком — при полностью зелёном прогоне.
 *
 * ПОЧЕМУ КЕЙСОВ ПРО СКЛЕЙКУ ДВА (И ПОЧЕМУ ОДНОГО МАЛО)
 * ----------------------------------------------------
 * `batchResults` склеен из ДВУХ источников — `buffer.getResults()` и
 * хвостового `results`, — и каждый из них в бою бывает ЕДИНСТВЕННЫМ:
 *  • буфер НЕПУСТ (KPI положил команды): `flush()` уносит весь cmdBatch
 *    вместе с `add_task`, хвостовой вызов работает на пустой очереди и
 *    возвращает [] — id приезжает ТОЛЬКО из `buffer.getResults()`;
 *  • буфер ПУСТ — `EventReportKpiFlowService.queue` выходит на
 *    `payloads.length === 0`, а `KpiListFlowService.flowDedup` делает
 *    `continue`, когда KPI-список на портале не установлен: тогда
 *    `buffer.queue` не зовут ни разу, `bufferSize === 0`, `flush()` —
 *    no-op, и весь cmdBatch с `add_task` уезжает ХВОСТОВЫМ вызовом —
 *    id приезжает ТОЛЬКО из `results`.
 * Поэтому кейса два, по одному на половину конкатенации: удаление любого из
 * двух источников уронит РОВНО ОДИН из них. Верни `batchResults: results` —
 * падает первый кейс; оставь `batchResults: buffer.getResults()` — падает
 * кейс с пустым буфером. Это и есть их единственная задача.
 *
 * Flow-сервисы замоканы: здесь проверяется НЕ бизнес-логика отчёта (её
 * покрывают соседние спеки), а маршрут ответа батча. Из task-flow сохранены
 * настоящие `ADD_TASK_CMD`/`parseAddedTaskId` — контракт ключа команды и
 * разбора id должен быть тем же, что в бою. Init-сервис в пакете создаётся
 * внутри функции, поэтому он тоже замокан (бэковая спека инжектила фейк
 * конструктором) — и, как бэковый фейк, СВОЙ flush не делает: оба HTTP-batch
 * стыка остаются за буфером и хвостовым вызовом.
 */

/** Ответ flush'а буфера: тот самый чанк с результатом `tasks.task.add`. */
const PLAN_TASK_ID = 987654;
const flushChunk = (): IBitrixBatchResponseResult =>
    ({
        result: { [ADD_TASK_CMD]: { task: { id: PLAN_TASK_ID } } },
        result_error: [],
        result_total: [],
        result_next: [],
        result_time: [],
    }) as unknown as IBitrixBatchResponseResult;

// --- flow-сервисы: заглушки, чтобы поднять use-case без Битрикса и портала ---

// Заглушки объявлены прямо внутри фабрик `vi.mock`: фабрики поднимаются
// выше объявлений модуля, поэтому общий хелпер в переменной здесь недоступен.

/**
 * Кладёт ли KPI-заглушка команду в буфер: `true` — буфер непуст и весь
 * cmdBatch уносит `flush()`, `false` — буфер пуст, `flush()` no-op и cmdBatch
 * уезжает хвостовым вызовом (портал без установленного KPI-списка).
 *
 * Это ЕДИНСТВЕННОЕ различие между двумя половинами стыка, поэтому переключаем
 * его флагом, а не вторым харнессом. Объект в `vi.hoisted`, а не булев
 * примитив: фабрика `vi.mock` поднимается выше объявлений, и читать значение
 * можно только в момент вызова метода — через живую ссылку.
 */
const mockKpiQueuesIntoBuffer = vi.hoisted(() => ({ value: true }));

vi.mock('../services/init/event-report-init.service', () => ({
    // Бэковый makeInit: { entityId: 42, entityType: COMPANY } — литерал
    // 'company' ≡ EEventReportEntityType.COMPANY (значения enum строковые).
    EventReportInitService: class {
        loadContext(): Promise<{ entityId: number; entityType: string }> {
            return Promise.resolve({ entityId: 42, entityType: 'company' });
        }
    },
}));
vi.mock('../services/entity/event-report-entity-flow.service', () => ({
    EventReportEntityFlowService: class {
        queue(): void {}
    },
}));
vi.mock('../services/deal/event-report-deal-flow.service', () => ({
    EventReportDealFlowService: class {
        queue(): { baseDealId: null } {
            return { baseDealId: null };
        }
    },
}));
vi.mock('../services/task/event-report-task-flow.service', async importOriginal => ({
    // Ключ команды и разбор id — настоящие: именно их контракт и проверяем.
    ...(await importOriginal<Record<string, unknown>>()),
    EventReportTaskFlowService: class {
        readClosingChecklist(): Promise<void> {
            return Promise.resolve();
        }
        queue(): void {}
        notifyTransfer(): Promise<void> {
            return Promise.resolve();
        }
    },
}));
vi.mock('../services/kpi-list/event-report-kpi-flow.service', () => ({
    // KPI — единственный, кто кладёт команды в буфер. Кладёт ли он их в
    // конкретном кейсе, решает mockKpiQueuesIntoBuffer: на боевом портале без
    // установленного KPI-списка настоящий сервис не кладёт ничего.
    EventReportKpiFlowService: class {
        queue(
            _ctx: unknown,
            _deals: unknown,
            buffer: { queue(fn: () => void): void },
        ): Promise<void> {
            if (mockKpiQueuesIntoBuffer.value) {
                buffer.queue(() => {});
            }
            return Promise.resolve();
        }
    },
}));
vi.mock('../services/post-fail/event-report-post-fail.service', () => ({
    EventReportPostFailService: class {
        queue(): void {}
    },
}));
vi.mock('../services/lead/event-report-lead-relation.service', () => ({
    EventReportLeadRelationService: class {
        queue(): void {}
    },
}));
vi.mock('../services/lead/event-report-lead-request-sync.service', () => ({
    EventReportLeadRequestSyncService: class {
        async run(): Promise<void> {}
    },
}));
vi.mock(
    '../services/return-to-tmc/event-report-return-to-tmc.service',
    () => ({
        EventReportReturnToTmcService: class {
            queue(): void {}
        },
    }),
);
vi.mock('../services/history/event-report-entity-history.service', () => ({
    EventReportEntityHistoryService: class {
        queue(): void {}
    },
}));

describe('executeEventReportFlow — ответ основного батча доезжает до досылки', () => {
    // Штатный портал: KPI-список установлен, команды в буфер кладутся.
    // Кейс с пустым буфером снимает флаг у себя внутри.
    beforeEach(() => {
        mockKpiQueuesIntoBuffer.value = true;
    });

    // Снимаем шпиона за настоящим буфером (ставит только кейс с пустым
    // буфером), чтобы он не протёк в соседние тесты.
    afterEach(() => {
        vi.restoreAllMocks();
    });

    /**
     * Dry-run-транспорт: первый `flush()` (его делает `buffer.flush()`)
     * отдаёт чанк с `add_task`, второй (хвостовой вызов use-case'а) —
     * пустой массив, как на уже опустошённой очереди. Все команды с
     * параметрами записываются — на этих фикстурах их быть не должно вовсе
     * (сервисы замоканы), что и фиксирует бэковая спека.
     */
    const makeBitrix = () =>
        makeDryRunTransport({ flushResponses: [[flushChunk()]] });

    const makePortal = () =>
        ({
            getPortal: () => ({ domain: 'portal.bitrix24.ru' }),
            getEntityFieldByCode: () => undefined,
            getFieldBitrixId: () => null,
        }) as unknown as FlowPortalSource;

    const silentLogger: FlowLogger = {
        log: () => undefined,
        warn: () => undefined,
        error: () => undefined,
    };

    /**
     * Сервер-паритет: гейтящиеся шаги разрешены — исполнитель идёт бэковым
     * маршрутом целиком (KPI в буфер, deal-композит, пост-волны); смарты
     * остаются досылкой всегда, их право здесь не трогаем.
     */
    const FULL_DIRECT_SETTINGS: FlowSettings = {
        capabilities: {
            allowKpiWrites: true,
            allowPresDealWrites: true,
            allowXoDealWrites: true,
            allowLeadRequestSync: true,
            allowTransferNotify: true,
        },
    };

    const dto = {
        domain: 'portal.bitrix24.ru',
        operationId: 'op-1',
    } as unknown as EventSalesFlowDto;

    it("наружу уезжает ответ flush'а буфера, а не пустой хвостовой вызов", async () => {
        const { transport, calls } = makeBitrix();

        const result = await executeEventReportFlow({
            dto,
            transport,
            portal: makePortal(),
            logger: silentLogger,
            settings: FULL_DIRECT_SETTINGS,
        });

        // Два HTTP-batch: flush буфера и хвостовой вызов use-case'а.
        expect(calls.filter(c => c.method === 'flush')).toHaveLength(2);
        // Сервисы замоканы — лишних команд транспорт не видел: состав
        // команд на этих фикстурах тот же, что в бэковой спеке (ноль).
        expect(calls.filter(c => c.method !== 'flush')).toEqual([]);

        // Регрессия: было `batchResults: results` → приезжал пустой массив.
        expect(result.batchResults).toHaveLength(1);
        expect(findBatchResult(result.batchResults, ADD_TASK_CMD)).toEqual({
            task: { id: PLAN_TASK_ID },
        });
    });

    it('planTaskId извлекается из того, что приехало в досылку', async () => {
        const { transport } = makeBitrix();

        const result = await executeEventReportFlow({
            dto,
            transport,
            portal: makePortal(),
            logger: silentLogger,
            settings: FULL_DIRECT_SETTINGS,
        });

        expect(
            parseAddedTaskId(
                findBatchResult(result.batchResults, ADD_TASK_CMD),
            ),
        ).toBe(PLAN_TASK_ID);
        expect(result.addedTaskId).toBe(PLAN_TASK_ID);
        // «Координатор» пакета — шаги side-flow: id план-задачи уезжает в
        // них, как в бэковый SideFlowJobBuildInput.planTaskId.
        expect(result.deferred.filter(s => s.kind === 'side-flow')).toEqual([
            {
                kind: 'side-flow',
                flow: 'zpr',
                addedTaskId: PLAN_TASK_ID,
                createdPresDealId: null,
            },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: PLAN_TASK_ID,
                createdPresDealId: null,
            },
        ]);
    });

    /**
     * Вторая половина конкатенации: буфер ПУСТ.
     *
     * На портале без установленного KPI-списка `buffer.queue` не зовут ни
     * разу: `bufferSize` остаётся 0, `endGroup()` выходит на пустой группе,
     * `flush()` — no-op, и весь cmdBatch (вместе с `add_task`) уходит РОВНО
     * ОДНИМ, хвостовым `flush()`. Здесь `buffer.getResults()` пуст, и
     * единственный источник id — `results`.
     *
     * В паре с кейсом выше это и есть страховка от «упрощения» склейки:
     * оставить один `buffer.getResults()` — падает этот тест, оставить один
     * `results` — падает тот.
     */
    it('буфер пуст: id план-задачи приезжает из хвостового вызова (портал без KPI-списка)', async () => {
        mockKpiQueuesIntoBuffer.value = false;
        // Шпион за НАСТОЯЩИМ буфером: доказываем, что в него действительно
        // ничего не положили, а не просто получили удобное число вызовов.
        const bufferQueueSpy = vi.spyOn(
            ColdHookBatchGroupBuffer.prototype,
            'queue',
        );
        // Шпион БЕЗ подмены поведения: нужен не для мока, а чтобы зафиксировать
        // фактически возвращённое значение — именно оно осталось бы от
        // «упрощённой» склейки.
        const bufferResultsSpy = vi.spyOn(
            ColdHookBatchGroupBuffer.prototype,
            'getResults',
        );

        const { transport, calls } = makeBitrix();

        const result = await executeEventReportFlow({
            dto,
            transport,
            portal: makePortal(),
            logger: silentLogger,
            settings: FULL_DIRECT_SETTINGS,
        });

        expect(bufferQueueSpy).not.toHaveBeenCalled();
        // Буфер отдал пустоту на КАЖДЫЙ вызов: значит всё, что доехало до
        // досылки, пришло из хвостового `results` и ниоткуда больше.
        expect(bufferResultsSpy).toHaveBeenCalled();
        for (const call of bufferResultsSpy.mock.results) {
            expect(call.value).toEqual([]);
        }
        // Ровно один HTTP-batch: flush оказался no-op, отправил хвостовой вызов.
        expect(calls.filter(c => c.method === 'flush')).toHaveLength(1);

        // Регрессия: `batchResults: buffer.getResults()` → приехал бы пустой
        // массив и planTaskId снова стал бы null — молча, только на порталах
        // без KPI-списка.
        expect(result.batchResults).toHaveLength(1);
        expect(
            parseAddedTaskId(
                findBatchResult(result.batchResults, ADD_TASK_CMD),
            ),
        ).toBe(PLAN_TASK_ID);
        expect(result.addedTaskId).toBe(PLAN_TASK_ID);
    });
});

/**
 * Тот же стык, но на голом контракте буфера — без use-case'а: страховка на
 * случай, если сборку use-case'а когда-нибудь переразложат по другим файлам.
 * Порядок вызовов здесь настоящий, буфер настоящий.
 */
describe("ColdHookBatchGroupBuffer — ответ flush'а не виден хвостовому вызову", () => {
    it('flush забирает весь cmdBatch: id план-задачи есть только в getResults()', async () => {
        const { transport } = makeDryRunTransport({
            flushResponses: [[flushChunk()]],
        });
        const buffer = new ColdHookBatchGroupBuffer(transport);

        buffer.queue(() => {});
        await buffer.endGroup();
        await buffer.flush();
        const tail = await transport.flush();

        // Хвостовой вызов пуст — брать только его значило бы потерять id.
        expect(tail).toEqual([]);
        expect(
            parseAddedTaskId(findBatchResult(tail, ADD_TASK_CMD)),
        ).toBeNull();
        expect(
            parseAddedTaskId(
                findBatchResult(buffer.getResults(), ADD_TASK_CMD),
            ),
        ).toBe(PLAN_TASK_ID);
    });
});
