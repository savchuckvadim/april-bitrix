import {
    DIRECT_MARKER_CMD,
    executeEventReportFlow,
    resolveOptionalGroupDeferredKinds,
} from '../execute-event-report.use-case';
import { ADD_TASK_CMD } from '../../services/task/event-report-task-flow.service';
import { IBitrixBatchResponseResult } from '../../shared/batch/batch-group-buffer';
import {
    makeDryRunTransport,
    type DryRunFlushResponse,
} from './dry-run-flow-transport';
import {
    appendMissingCommandErrors,
    normalizeCallBatchResponse,
} from '../../adapters/browser/batch-response';
import type { FlowLogger } from '../../ports/flow-logger.port';
import type { FlowPortalSource } from '../../ports/flow-portal.port';
import type { FlowSettings } from '../../ports/flow-settings';
import type { EventSalesFlowDto } from '../../dto/event-sale-flow/event-sales-flow.dto';

/**
 * Досылка против прямого исполнения (пакетная спека А2, бэкового донора
 * нет): исполнитель на НАСТОЯЩИХ сервисах и dry-run-транспорте.
 *
 *  1. С ДЕФОЛТНОЙ картой прав (пустые settings) гейтящиеся шаги — KPI,
 *     pres/xo-движения, side-flow, lead-request-sync, transfer-notify —
 *     уходят в deferred[], а НЕ в транспорт: ни одной их команды в
 *     cmdBatch; ядро прямого пути (задача плана, entity-обновление)
 *     исполняется как раньше.
 *  2. С полными правами тот же payload идёт бэковым маршрутом целиком:
 *     эталонная цепочка deal-команд с `$result[set_pres_deal]`-связкой
 *     (как в deal-flow-batch-commands.spec), KPI-команды через групповой
 *     буфер, порядок групп «читающий init-батч → пишущий батч → пустой
 *     хвост».
 *
 * Эталонный payload — компания 431, отчёт «презентация состоялась» по
 * pres-сделке задачи, план следующей презентации (фикстура
 * deal-flow-batch-commands.spec, поднятая до полного прогона: сделки
 * приезжают ЧИТАЮЩИМ батчем init'а, а не готовым init-снимком).
 */

const PLAN_TASK_ID = 987654;

const stage = (code: string, bitrixId: string) => ({
    bitrixId,
    code,
    name: code,
});

/** Воронки эталонного портала (стадии — как в calculator-спеке). */
const CATEGORIES: Record<string, unknown> = {
    sales_base: {
        bitrixId: 17,
        code: 'sales_base',
        stages: [
            stage('sales_new', 'NEW'),
            stage('sales_warm', 'WARM'),
            stage('sales_pres', 'PRES'),
            stage('sales_in_progress', 'HOT'),
            stage('sales_money_await', 'PAY'),
            stage('sales_success', 'WON'),
            stage('sales_fail', 'LOSE'),
            stage('sales_double', 'APOLOGY'),
            stage('sales_not_ca', 'NOT_CA'),
        ],
    },
    sales_xo: {
        bitrixId: 32,
        code: 'sales_xo',
        stages: [
            stage('cold_pending', 'PENDING'),
            stage('cold_success', 'WON'),
            stage('cold_fail', 'LOSE'),
            stage('cold_noresult', 'NORESULT'),
        ],
    },
    sales_presentation: {
        bitrixId: 48,
        code: 'sales_presentation',
        stages: [
            stage('spres_plan', 'PLAN'),
            stage('spres_pending', 'PENDING'),
            stage('spres_success', 'WON'),
            stage('spres_fail', 'LOSE'),
            stage('spres_noresult', 'NORESULT'),
        ],
    },
    tmc_base: {
        bitrixId: 61,
        code: 'tmc_base',
        stages: [
            stage('sales_tmc_plan', 'PLAN'),
            stage('sales_tmc_pending', 'PENDING'),
            stage('sales_tmc_pres_in_progress', 'PRES_IN_PROGRESS'),
            stage('sales_tmc_success', 'WON'),
            stage('sales_tmc_fail', 'LOSE'),
            stage('sales_tmc_noresult', 'NORESULT'),
        ],
    },
};

const buildList = (group: string, type: string, bitrixId: string) => ({
    group,
    type,
    bitrixId,
    title: 'L',
    name: 'l',
    bitrixfields: [
        {
            type: 'string',
            code: `${group}_${type}_event_title`,
            name: 'Название',
            title: 'Название',
            bitrixId: 'PROPERTY_1',
            bitrixCamelId: 'PROPERTY_1',
            items: [],
        },
    ],
});

const makePortal = () =>
    ({
        getTimezone: () => 'Europe/Moscow',
        getEntityFieldByCode: (_entity: string, code: string) =>
            code === 'pres_count'
                ? { bitrixId: 'PRES_COUNT', items: [] }
                : undefined,
        getFieldBitrixId: (field: { bitrixId: string }) =>
            `UF_CRM_${field.bitrixId}`,
        getFieldItemByCode: () => undefined,
        getPortal: () => ({ domain: 'd.b24.ru' }),
        getDealCategoryByCode: (code: string) => CATEGORIES[code],
        getDealCategories: () => Object.values(CATEGORIES),
        getListByCode: (code: string) =>
            code === 'sales_kpi'
                ? buildList('sales', 'kpi', '10')
                : code === 'sales_history'
                  ? buildList('sales', 'history', '20')
                  : undefined,
        getSalesTaskGroupId: () => 41,
    }) as unknown as FlowPortalSource;

/**
 * Эталонный DTO: компания-владелец, отчёт «презентация состоялась» по
 * текущей pres-сделке (привязана к задаче через ufCrmTask), план следующей
 * презентации. Сделки base/pres/tmc НЕ в снимке — их привезёт читающий
 * батч init'а (ответ первого flush'а).
 */
const makeDto = () =>
    ({
        domain: 'd.b24.ru',
        operationId: 'op-e2e-1',
        context: { companyId: 431 },
        presentation: { isPresentationDone: true },
        currentTask: {
            eventType: 'presentation',
            name: 'ООО Ромашка',
            ufCrmTask: ['D_900', 'D_777'],
        },
        report: { resultStatus: 'result' },
        plan: {
            isPlanned: true,
            isActive: true,
            name: 'ООО Ромашка',
            responsibility: { ID: 8 },
            type: { current: { code: 'presentation' } },
        },
    }) as unknown as EventSalesFlowDto;

const chunk = (
    result: Record<string, unknown>,
    resultError: Record<string, unknown> | [] = [],
): IBitrixBatchResponseResult =>
    ({
        result,
        result_error: resultError,
        result_total: [],
        result_next: [],
    }) as IBitrixBatchResponseResult;

/** Ответ читающего init-батча: компания + сделки трёх воронок. */
const initChunk = () =>
    chunk({
        get_company: { ID: '431', TITLE: 'ООО Ромашка' },
        list_deals: [
            {
                ID: '500',
                CATEGORY_ID: '17',
                ASSIGNED_BY_ID: '8',
                STAGE_ID: 'C17:WARM',
            },
            { ID: '900', CATEGORY_ID: '48', ASSIGNED_BY_ID: '8' },
            { ID: '777', CATEGORY_ID: '61', ASSIGNED_BY_ID: '8' },
        ],
    });

/** Ответ пишущего батча: создалась план-задача. */
const mainChunk = () =>
    chunk({ [ADD_TASK_CMD]: { task: { id: PLAN_TASK_ID } } });

const silentLogger: FlowLogger = {
    log: () => undefined,
    warn: () => undefined,
    error: () => undefined,
};

const FULL_DIRECT_SETTINGS: FlowSettings = {
    capabilities: {
        allowKpiWrites: true,
        allowPresDealWrites: true,
        allowXoDealWrites: true,
        allowLeadRequestSync: true,
        allowTransferNotify: true,
    },
};

const run = async (
    settings: FlowSettings,
    responses?: DryRunFlushResponse[],
) => {
    const harness = makeDryRunTransport({
        flushResponses: responses ?? [[initChunk()], [mainChunk()]],
    });
    const result = await executeEventReportFlow({
        dto: makeDto(),
        transport: harness.transport,
        portal: makePortal(),
        logger: silentLogger,
        settings,
    });
    return { ...harness, result };
};

describe('executeEventReportFlow — дефолтная карта прав: гейтящиеся шаги в deferred, а не в транспорт', () => {
    it('KPI/pres/xo/side-flow (+sync, notify) уходят в deferred в порядке оркестрации', async () => {
        const { result } = await run({});

        expect(result.deferred).toEqual([
            { kind: 'pres-deals' },
            { kind: 'xo-deals' },
            { kind: 'kpi' },
            { kind: 'lead-request-sync' },
            { kind: 'transfer-notify' },
            {
                kind: 'side-flow',
                flow: 'zpr',
                addedTaskId: PLAN_TASK_ID,
                // Фикстуры pres-сделку батчем не создают — id честно null.
                createdPresDealId: null,
            },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: PLAN_TASK_ID,
                // Фикстуры pres-сделку батчем не создают — id честно null.
                createdPresDealId: null,
            },
        ]);
        expect(result.addedTaskId).toBe(PLAN_TASK_ID);
        expect(result.errors).toEqual([]);
    });

    it('команды гейтящихся шагов в транспорт НЕ ставятся, ядро — исполняется', async () => {
        const { result, calls, flushes } = await run({});

        // Движения сделок не ставились вовсе (deal.getList — читающий
        // батч init'а, он остаётся).
        expect(
            calls.filter(
                c => c.method === 'deal.update' || c.method === 'deal.set',
            ),
        ).toEqual([]);
        // KPI-записей нет — ни батчем, ни дедуп-чтением.
        expect(calls.filter(c => c.method === 'listItem.add')).toEqual([]);
        expect(calls.filter(c => c.method === 'call.listItemGet')).toEqual([]);
        // Волны lead-request-sync не ходили.
        expect(calls.filter(c => c.method === 'lead.get')).toEqual([]);
        expect(calls.filter(c => c.method === 'lead.update')).toEqual([]);
        // im-уведомление о переносе не отправлялось.
        expect(
            calls.filter(c => c.method === 'call.imNotifySystemAdd'),
        ).toEqual([]);

        // Ядро прямого пути живо: план-задача и entity-обновление компании.
        const taskAdds = calls.filter(c => c.method === 'task.add');
        expect(taskAdds.map(c => c.cmd)).toEqual([ADD_TASK_CMD]);
        expect(
            calls.filter(c => c.method === 'company.update').map(c => c.cmd),
        ).toEqual(['update_entity_company_431']);

        // Два HTTP-batch: читающий init и хвостовой пишущий (буфер пуст —
        // KPI досылкой, его flush no-op).
        expect(flushes).toHaveLength(2);
        expect(flushes[0].cmds).toEqual(['get_company', 'list_deals']);
        expect(flushes[1].cmds).toContain(ADD_TASK_CMD);
        expect(flushes[1].cmds).toContain('update_entity_company_431');
        expect(result.batchResults).toEqual([mainChunk()]);
    });

    it('result_error пишущего батча разобран по командам, addedTaskId честный null', async () => {
        const { result } = await run({}, [
            [initChunk()],
            [
                chunk(
                    {},
                    {
                        [ADD_TASK_CMD]: {
                            error: 'ACCESS_DENIED',
                            error_description: 'нет прав на задачи',
                        },
                    },
                ),
            ],
        ]);

        expect(result.errors).toEqual([
            {
                cmd: ADD_TASK_CMD,
                error: {
                    error: 'ACCESS_DENIED',
                    error_description: 'нет прав на задачи',
                },
            },
        ]);
        expect(result.addedTaskId).toBeNull();
        // Плана-задачи нет — шаги side-flow честно везут null.
        expect(result.deferred.filter(s => s.kind === 'side-flow')).toEqual([
            {
                kind: 'side-flow',
                flow: 'zpr',
                addedTaskId: null,
                // Фикстуры pres-сделку батчем не создают — id честно null.
                createdPresDealId: null,
            },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: null,
                // Фикстуры pres-сделку батчем не создают — id честно null.
                createdPresDealId: null,
            },
        ]);
    });
});

describe('executeEventReportFlow — полные права: бэковый маршрут целиком (сервер-паритет)', () => {
    it('эталонная deal-цепочка с $result-связкой, KPI через буфер, side-flow всё равно досылкой', async () => {
        const { result, calls, flushes } = await run(FULL_DIRECT_SETTINGS);

        // Досылка — только смарты (они на бэке и были отдельными очередями).
        expect(result.deferred).toEqual([
            {
                kind: 'side-flow',
                flow: 'zpr',
                addedTaskId: PLAN_TASK_ID,
                // Фикстуры pres-сделку батчем не создают — id честно null.
                createdPresDealId: null,
            },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: PLAN_TASK_ID,
                // Фикстуры pres-сделку батчем не создают — id честно null.
                createdPresDealId: null,
            },
        ]);

        // Эталонная цепочка deal-команд — как в deal-flow-batch-commands.spec.
        const dealCmds = calls
            .filter(c => c.method === 'deal.update' || c.method === 'deal.set')
            .map(c => c.cmd);
        expect(dealCmds).toEqual([
            'update_base_deal_500',
            'update_pres_deal_900',
            'set_pres_deal',
            'update_tmc_to_pres_777',
        ]);
        // ТМЦ привязывается к новой pres-сделке ЧЕРЕЗ $result-ссылку.
        const tmc = calls.find(c => c.cmd === 'update_tmc_to_pres_777');
        expect(tmc?.args[1]).toMatchObject({
            UF_CRM_TO_PRESENTATION_SALES: '$result[set_pres_deal]',
        });

        // KPI пишется — команды поставлены групповым буфером.
        const kpiAdds = calls.filter(c => c.method === 'listItem.add');
        expect(kpiAdds.length).toBeGreaterThan(0);
        for (const add of kpiAdds) {
            expect(['10', '20']).toContain(
                (add.args[0] as { IBLOCK_ID: string }).IBLOCK_ID,
            );
        }

        // Порядок групп: читающий init-батч (без единой пишущей команды) →
        // пишущий батч (flush буфера уносит ВЕСЬ cmdBatch: прямые команды
        // сервисов + KPI-команды буфера) → пустой хвостовой вызов.
        expect(flushes).toHaveLength(3);
        expect(flushes[0].cmds).toEqual(['get_company', 'list_deals']);
        const writeCmds = flushes[1].cmds;
        expect(writeCmds).toContain(ADD_TASK_CMD);
        for (const cmd of dealCmds) {
            expect(writeCmds).toContain(cmd as string);
        }
        // Прямые команды сервисов едут раньше материализованных KPI-команд,
        // взаимный порядок deal-цепочки сохранён и внутри cmdBatch.
        const at = (cmd: string) => writeCmds.indexOf(cmd);
        expect(at('update_base_deal_500')).toBeLessThan(at('set_pres_deal'));
        expect(at('set_pres_deal')).toBeLessThan(at('update_tmc_to_pres_777'));
        const kpiKeys = kpiAdds.map(c => c.cmd as string);
        for (const kpiKey of kpiKeys) {
            expect(at(ADD_TASK_CMD)).toBeLessThan(at(kpiKey));
        }
        expect(flushes[2].cmds).toEqual([]);

        // Ответ пишущего батча пришёл из flush'а буфера, хвост пуст —
        // склейка отдала его наружу (шов batch-seam).
        expect(result.batchResults).toEqual([mainChunk()]);
        expect(result.addedTaskId).toBe(PLAN_TASK_ID);
    });
});

describe('executeEventReportFlow — createdPresDealId в досылке', () => {
    it('pres-сделка, созданная этим батчем, уезжает в side-flow шаги её id', async () => {
        // Зеркало координатора: parseCreatedDealId(set_pres_deal) из ответа
        // ТОГО ЖЕ батча — серверные билдеры ждут presDealId || createdPresDealId.
        const { result } = await run({}, [
            [initChunk()],
            [
                chunk({
                    [ADD_TASK_CMD]: { task: { id: PLAN_TASK_ID } },
                    set_pres_deal: 777,
                }),
            ],
        ]);

        expect(
            result.deferred.filter(step => step.kind === 'side-flow'),
        ).toEqual([
            {
                kind: 'side-flow',
                flow: 'zpr',
                addedTaskId: PLAN_TASK_ID,
                createdPresDealId: 777,
            },
            {
                kind: 'side-flow',
                flow: 'pres',
                addedTaskId: PLAN_TASK_ID,
                createdPresDealId: 777,
            },
        ]);
    });
});

describe('executeEventReportFlow — маркер анти-двойного исполнения (А4)', () => {
    const MARKER = {
        taskId: 3001,
        text: 'Отчёт исполнен напрямую. [evflow:op-e2e-1]',
        authorId: 8,
    };

    it('directMarker уходит task.commentAdd ПЕРВОЙ командой пишущего батча', async () => {
        const { calls, flushes } = await run({ directMarker: MARKER });

        const marker = calls.filter(c => c.method === 'task.commentAdd');
        expect(marker).toHaveLength(1);
        expect(marker[0]!.cmd).toBe(DIRECT_MARKER_CMD);
        expect(marker[0]!.args).toEqual([
            3001,
            {
                AUTHOR_ID: 8,
                POST_MESSAGE: 'Отчёт исполнен напрямую. [evflow:op-e2e-1]',
            },
        ]);
        // Читающий батч init'а маркер не везёт; пишущий НАЧИНАЕТСЯ с него —
        // отправился батч, значит маркер записан (halt=0).
        expect(flushes[0]!.cmds).toEqual(['get_company', 'list_deals']);
        expect(flushes[1]!.cmds[0]).toBe(DIRECT_MARKER_CMD);
    });

    it('без directMarker команда не ставится — состав батча бэковый', async () => {
        const { calls } = await run({});

        expect(calls.filter(c => c.method === 'task.commentAdd')).toEqual([]);
    });
});

describe('executeEventReportFlow — явная карта прав со всеми false ≡ пустой (дефолты доктрины А4)', () => {
    it('гейтящиеся шаги в deferred, их команды в транспорт не ставятся', async () => {
        const { result, calls } = await run({
            capabilities: {
                allowSmartWrites: false,
                allowKpiWrites: false,
                allowPresDealWrites: false,
                allowXoDealWrites: false,
                allowLeadRequestSync: false,
                allowTransferNotify: false,
            },
        });

        expect(result.deferred.map(step => step.kind)).toEqual([
            'pres-deals',
            'xo-deals',
            'kpi',
            'lead-request-sync',
            'transfer-notify',
            'side-flow',
            'side-flow',
        ]);
        // Команд гейтящихся групп нет: ни движений сделок, ни KPI, ни im.
        expect(
            calls.filter(
                c => c.method === 'deal.update' || c.method === 'deal.set',
            ),
        ).toEqual([]);
        expect(calls.filter(c => c.method === 'listItem.add')).toEqual([]);
        expect(
            calls.filter(c => c.method === 'call.imNotifySystemAdd'),
        ).toEqual([]);
        // Ядро живо: план-задача ставится.
        expect(calls.filter(c => c.method === 'task.add')).toHaveLength(1);
    });
});

describe('executeEventReportFlow — тонкий раскрой ACCESS_DENIED (А4)', () => {
    it('ACCESS_DENIED опциональных групп конвертируется в deferred, обязательной — остаётся ошибкой', async () => {
        const { result } = await run(FULL_DIRECT_SETTINGS, [
            [initChunk()],
            [
                chunk(
                    { [ADD_TASK_CMD]: { task: { id: PLAN_TASK_ID } } },
                    {
                        set_pres_deal: {
                            error: 'ACCESS_DENIED',
                            error_description: 'нет прав на воронку',
                        },
                        upd_list_item_kpi_431: {
                            error: 'ACCESS_DENIED',
                            error_description: 'нет прав на список',
                        },
                        update_entity_company_431: {
                            error: 'ACCESS_DENIED',
                            error_description: 'нет прав на компанию',
                        },
                    },
                ),
            ],
        ]);

        // Конвертированы только опциональные группы.
        expect(result.deferredErrors.map(f => f.cmd).sort()).toEqual([
            'set_pres_deal',
            'upd_list_item_kpi_431',
        ]);
        // Их семантические шаги появились в досылке (при полных правах их
        // там не было), xo-движение не задето — шага нет.
        expect(result.deferred.some(s => s.kind === 'pres-deals')).toBe(true);
        expect(result.deferred.some(s => s.kind === 'kpi')).toBe(true);
        expect(result.deferred.some(s => s.kind === 'xo-deals')).toBe(false);
        // Обязательная команда (entity-flow) конверсии не получает: она в
        // errors, но не в deferredErrors — прямой путь судит по разности.
        expect(result.errors.map(f => f.cmd)).toContain(
            'update_entity_company_431',
        );
        expect(result.deferredErrors.map(f => f.cmd)).not.toContain(
            'update_entity_company_431',
        );
    });

    it('шаг не дублируется, если его kind уже лежит в досылке', async () => {
        // Дефолтные права: kpi уже в deferred гейтом; ACCESS_DENIED
        // KPI-команды второй шаг не добавляет.
        const { result } = await run({}, [
            [initChunk()],
            [
                chunk(
                    { [ADD_TASK_CMD]: { task: { id: PLAN_TASK_ID } } },
                    {
                        add_list_item_kpi_431_x: {
                            error: 'ACCESS_DENIED',
                            error_description: '-',
                        },
                    },
                ),
            ],
        ]);

        expect(result.deferred.filter(s => s.kind === 'kpi')).toHaveLength(1);
        expect(result.deferredErrors.map(f => f.cmd)).toEqual([
            'add_list_item_kpi_431_x',
        ]);
    });

    it('deal-композит без собственного kind (база/ТМЦ) конвертируется в ПАРУ шагов — как в грубом гейте', async () => {
        const { result } = await run(FULL_DIRECT_SETTINGS, [
            [initChunk()],
            [
                chunk(
                    {},
                    {
                        update_base_deal_500: {
                            error: 'ACCESS_DENIED',
                            error_description: '-',
                        },
                    },
                ),
            ],
        ]);

        expect(result.deferredErrors.map(f => f.cmd)).toEqual([
            'update_base_deal_500',
        ]);
        expect(result.deferred.some(s => s.kind === 'pres-deals')).toBe(true);
        expect(result.deferred.some(s => s.kind === 'xo-deals')).toBe(true);
    });

    it('не-ACCESS_DENIED ошибка опциональной группы конверсии не получает', async () => {
        const { result } = await run(FULL_DIRECT_SETTINGS, [
            [initChunk()],
            [
                chunk(
                    { [ADD_TASK_CMD]: { task: { id: PLAN_TASK_ID } } },
                    {
                        set_pres_deal: {
                            error: 'QUERY_LIMIT_EXCEEDED',
                            error_description: 'лимит запросов',
                        },
                    },
                ),
            ],
        ]);

        expect(result.deferredErrors).toEqual([]);
        expect(result.deferred.some(s => s.kind === 'pres-deals')).toBe(false);
        expect(result.errors.map(f => f.cmd)).toEqual(['set_pres_deal']);
    });

    it('карта соответствия: обязательные команды не имеют deferred-представления', () => {
        // Опциональные группы.
        expect(
            resolveOptionalGroupDeferredKinds('add_list_item_kpi_1_x'),
        ).toEqual(['kpi']);
        expect(
            resolveOptionalGroupDeferredKinds('upd_list_item_kpi_1'),
        ).toEqual(['kpi']);
        expect(resolveOptionalGroupDeferredKinds('set_pres_deal')).toEqual([
            'pres-deals',
        ]);
        expect(
            resolveOptionalGroupDeferredKinds('set_unplanned_pres_deal'),
        ).toEqual(['pres-deals']);
        expect(
            resolveOptionalGroupDeferredKinds('update_pres_deal_900'),
        ).toEqual(['pres-deals']);
        expect(
            resolveOptionalGroupDeferredKinds('cancel_pres_deal_900'),
        ).toEqual(['pres-deals']);
        expect(resolveOptionalGroupDeferredKinds('update_xo_deal_5')).toEqual([
            'xo-deals',
        ]);
        expect(resolveOptionalGroupDeferredKinds('set_base_deal')).toEqual([
            'pres-deals',
            'xo-deals',
        ]);
        expect(
            resolveOptionalGroupDeferredKinds('update_base_deal_500'),
        ).toEqual(['pres-deals', 'xo-deals']);
        expect(
            resolveOptionalGroupDeferredKinds('update_tmc_to_pres_777'),
        ).toEqual(['pres-deals', 'xo-deals']);
        expect(resolveOptionalGroupDeferredKinds('close_tmc_777')).toEqual([
            'pres-deals',
            'xo-deals',
        ]);
        expect(
            resolveOptionalGroupDeferredKinds('move_count_deal_500'),
        ).toEqual(['pres-deals', 'xo-deals']);
        // Обязательные: entity, задачи, история, маркер, возврат в ТМЦ.
        expect(
            resolveOptionalGroupDeferredKinds('update_entity_company_431'),
        ).toBeNull();
        expect(resolveOptionalGroupDeferredKinds(ADD_TASK_CMD)).toBeNull();
        expect(resolveOptionalGroupDeferredKinds('complete_task_1')).toBeNull();
        expect(resolveOptionalGroupDeferredKinds('add_history_1')).toBeNull();
        expect(resolveOptionalGroupDeferredKinds(DIRECT_MARKER_CMD)).toBeNull();
        expect(resolveOptionalGroupDeferredKinds('return_tmc_777')).toBeNull();
    });
});

/**
 * ФРЕЙМОВАЯ форма ответа сквозняком (MAJOR-2). Прежние кейсы этой спеки
 * моделируют dev-режим — там `result_error` приходит объектом, и провал
 * команды виден. Во ФРЕЙМЕ его нет вовсе: b24jssdk 2.0.0 с
 * `returnAjaxResult:false` собирает в ответ ТОЛЬКО успешные команды, а
 * упавшая просто отсутствует. Здесь ответ строится ровно так — плоской
 * мапой выживших — и прогоняется через РЕАЛЬНЫЙ разбор браузерного
 * адаптера: именно эту связку дефект и проскакивал.
 */
describe('executeEventReportFlow — фреймовый ответ: пропавшая команда судится как провал', () => {
    /**
     * Ответ фрейма: все отправленные команды, КРОМЕ перечисленных упавших
     * (их в мапе просто нет), + разбор адаптера — как в живом транспорте.
     */
    const frameFlush =
        (failing: string[], values: Record<string, unknown> = {}) =>
        (cmds: string[]): IBitrixBatchResponseResult[] => {
            const data: Record<string, unknown> = {};
            for (const cmd of cmds) {
                if (failing.includes(cmd)) continue;
                data[cmd] = values[cmd] ?? true;
            }
            return appendMissingCommandErrors(
                normalizeCallBatchResponse(data),
                cmds,
            ).chunks;
        };

    const TASK_VALUE = { [ADD_TASK_CMD]: { task: { id: PLAN_TASK_ID } } };

    it('упавшая ОБЯЗАТЕЛЬНАЯ команда — ошибка NO_RESPONSE без конверсии в досылку', async () => {
        const { result } = await run({}, [
            [initChunk()],
            frameFlush(['update_entity_company_431'], TASK_VALUE),
        ]);

        expect(result.errors).toEqual([
            {
                cmd: 'update_entity_company_431',
                error: {
                    error: 'NO_RESPONSE',
                    error_description: expect.any(String),
                },
            },
        ]);
        // Обязательной группе конверсии нет: прямой исполнитель обязан
        // увидеть провал (errors минус deferredErrors), а не «успех».
        expect(result.deferredErrors).toEqual([]);
    });

    it('упавшая ОПЦИОНАЛЬНАЯ команда конвертируется в досылку (причину фрейм не показывает)', async () => {
        const { result } = await run(FULL_DIRECT_SETTINGS, [
            [initChunk()],
            frameFlush(['set_pres_deal'], TASK_VALUE),
        ]);

        expect(result.deferredErrors.map(f => f.cmd)).toEqual([
            'set_pres_deal',
        ]);
        expect(result.deferred.some(s => s.kind === 'pres-deals')).toBe(true);
    });

    it('фрейм ответил по всем командам — ошибок нет (ложных срабатываний тоже)', async () => {
        const { result } = await run({}, [
            [initChunk()],
            frameFlush([], TASK_VALUE),
        ]);

        expect(result.errors).toEqual([]);
        expect(result.deferredErrors).toEqual([]);
        expect(result.addedTaskId).toBe(PLAN_TASK_ID);
    });
});

describe('executeEventReportFlow — неподдержанное право (MINOR-6)', () => {
    it('allowSmartWrites: true — жёсткий отказ ДО первого обращения к Битриксу', async () => {
        const harness = makeDryRunTransport({
            flushResponses: [[initChunk()], [mainChunk()]],
        });

        await expect(
            executeEventReportFlow({
                dto: makeDto(),
                transport: harness.transport,
                portal: makePortal(),
                logger: silentLogger,
                // Каст: тип карты прав больше не даёт включить флаг из TS —
                // рантайм-гард страхует JS-вызовы и касты вроде этого.
                settings: {
                    capabilities: { allowSmartWrites: true },
                } as unknown as FlowSettings,
            }),
        ).rejects.toThrow(/allowSmartWrites/);

        // Ни одной команды, ни одного flush: отказ до чтения и до записи.
        expect(harness.calls).toEqual([]);
        expect(harness.flushes).toEqual([]);
    });
});
