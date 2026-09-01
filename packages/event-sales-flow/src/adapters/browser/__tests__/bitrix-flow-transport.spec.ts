/**
 * BitrixFlowTransport: маппинг batch-команд на bitrix.batch.* с сохранением
 * cmd-ключей и порядка (включая дозаведённые в А4 task.add/complete/
 * commentAdd, checklistItem.add, listItem.update), flush-примитив (один
 * callBatch, [] на пустом cmdBatch), конверты call-методов, разбор
 * result_error и работа под групповым буфером — всё на фейке
 * Bitrix.getService (мок синглтона @workspace/bitrix).
 */
import { vi } from 'vitest';

const { getServiceMock } = vi.hoisted(() => ({ getServiceMock: vi.fn() }));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: { getService: getServiceMock },
}));

import type { BitrixService } from '@workspace/bitrix';
import {
    BitrixFlowTransport,
    appendMissingCommandErrors,
    normalizeCallBatchResponse,
    planBatchChunks,
} from '../bitrix-flow-transport';
import { ColdHookBatchGroupBuffer } from '../../../shared/batch/batch-group-buffer';
import type { FlowLogger } from '../../../ports/flow-logger.port';

/** Запись одного вызова доменного сервиса фейка. */
interface RecordedCall {
    method: string;
    args: unknown[];
}

/**
 * Фейк BitrixService: batch-методы кладут cmd-ключ в живой cmdBatch (как
 * addCmdBatchType), callBatch отдаёт подготовленный ответ и чистит cmdBatch
 * (как bitrix-base-api после успешной отправки).
 */
const createFakeService = () => {
    const calls: RecordedCall[] = [];
    const cmdBatch: Record<string, unknown> = {};
    /** Слепок cmd-ключей КАЖДОГО callBatch — по нему видно состав чанков. */
    const sent: string[][] = [];
    let nextResponse: unknown = {};
    const responseQueue: unknown[] = [];
    /** Номера вызовов callBatch (с 1), которые должны упасть. */
    const failingCalls = new Set<number>();

    const record =
        (method: string) =>
        (...args: unknown[]) => {
            calls.push({ method, args });
            const cmd = String(args[0]);
            if (!cmdBatch[cmd]) {
                // Как addCmdBatchType: тело команды с параметрами — в них и
                // живут ссылки `$result[...]`.
                cmdBatch[cmd] = { method, params: args.slice(1) };
            }
        };
    const callBatch = vi.fn(async (): Promise<unknown> => {
        const keys = Object.keys(cmdBatch);
        sent.push(keys);
        if (failingCalls.has(sent.length)) {
            // Упавший callBatch до очистки cmdBatch не доходит — как в
            // bitrix-base-api (this.cmdBatch = {} стоит ПОСЛЕ await).
            throw new Error(`сеть упала на вызове ${sent.length}`);
        }
        for (const key of keys) delete cmdBatch[key];
        return responseQueue.length > 0 ? responseQueue.shift() : nextResponse;
    });
    const dealGet = vi.fn(async () => ({ ID: 5, TITLE: 'сделка' }));
    const dealGetList = vi.fn(async () => ({ result: [{ ID: 1 }] }));
    const leadGetFieldsList = vi.fn(async () => ({
        result: [{ ID: 9, FIELD_NAME: 'UF_CRM_TO_SALE_DEAL' }],
    }));
    const listItemGet = vi.fn(async () => ({ result: [] }));
    const checklistItemGetList = vi.fn(async () => ({
        result: [
            { ID: '431', TITLE: 'Чек-лист', IS_COMPLETE: 'N', SORT_INDEX: '0' },
        ],
    }));
    const imNotifySystemAdd = vi.fn(async () => ({ result: 12345 }));

    const service = {
        api: { callBatch, getCmdBatch: () => cmdBatch },
        batch: {
            deal: {
                update: record('batch.deal.update'),
                set: record('batch.deal.set'),
                getList: record('batch.deal.getList'),
            },
            lead: {
                get: record('batch.lead.get'),
                update: record('batch.lead.update'),
                getField: record('batch.lead.getField'),
            },
            company: {
                get: record('batch.company.get'),
                update: record('batch.company.update'),
            },
            contact: { get: record('batch.contact.get') },
            task: {
                add: record('batch.task.add'),
                update: record('batch.task.update'),
                complete: record('batch.task.complete'),
                commentAdd: record('batch.task.commentAdd'),
            },
            checklistItem: { add: record('batch.checklistItem.add') },
            timeline: {
                addTimelineComment: record('batch.timeline.addTimelineComment'),
            },
            listItem: {
                add: record('batch.listItem.add'),
                update: record('batch.listItem.update'),
            },
        },
        deal: { get: dealGet, getList: dealGetList },
        lead: { getFieldsList: leadGetFieldsList },
        listItem: { get: listItemGet },
        checklistItem: { getList: checklistItemGetList },
        imNotify: { systemAdd: imNotifySystemAdd },
    };

    return {
        calls,
        cmdBatch,
        sent,
        callBatch,
        /** Ответы по порядку вызовов callBatch (исчерпались — nextResponse). */
        respondEach: (responses: unknown[]) => {
            responseQueue.push(...responses);
        },
        /** Сделать N-й вызов callBatch падающим (нумерация с 1). */
        failCall: (index: number) => {
            failingCalls.add(index);
        },
        dealGet,
        dealGetList,
        leadGetFieldsList,
        listItemGet,
        checklistItemGetList,
        imNotifySystemAdd,
        respondWith: (response: unknown) => {
            nextResponse = response;
        },
        service: service as unknown as BitrixService,
    };
};

const createFakeLogger = (): FlowLogger & {
    warnMock: ReturnType<typeof vi.fn>;
    errorMock: ReturnType<typeof vi.fn>;
} => {
    const warnMock = vi.fn();
    const errorMock = vi.fn();
    return {
        log: vi.fn(),
        warn: warnMock,
        error: errorMock,
        warnMock,
        errorMock,
    };
};

const setup = () => {
    const fake = createFakeService();
    const logger = createFakeLogger();
    const transport = new BitrixFlowTransport({
        service: fake.service,
        logger,
    });
    return { fake, logger, transport };
};

beforeEach(() => {
    getServiceMock.mockReset();
});

describe('BitrixFlowTransport: маппинг batch-команд', () => {
    it('batch-команда ложится в bitrix.batch.* синхронно, с тем же cmd-ключом и аргументами', () => {
        const { fake, transport } = setup();
        transport.batch.deal.update('update_deal_10', 10, {
            STAGE_ID: 'C34:WON',
        });
        expect(fake.calls).toEqual([
            {
                method: 'batch.deal.update',
                args: ['update_deal_10', 10, { STAGE_ID: 'C34:WON' }],
            },
        ]);
        // накопление, не отправка: cmdBatch наполнен, HTTP не было
        expect(Object.keys(fake.cmdBatch)).toEqual(['update_deal_10']);
        expect(fake.callBatch).not.toHaveBeenCalled();
    });

    it('маппит все методы порта на свои bitrix.batch.* с сохранением порядка', () => {
        const { fake, transport } = setup();

        transport.batch.company.get('get_company', 7);
        transport.batch.deal.getList('list_deals', { COMPANY_ID: '7' }, [
            'ID',
            'STAGE_ID',
        ]);
        transport.batch.lead.get('get_owner_lead', 42, ['ID']);
        transport.batch.contact.get('get_report_contact', 3);
        transport.batch.deal.set('create_pres_deal', { TITLE: 'През.' });
        transport.batch.lead.update('lr_sync_upd_42', 42, { STATUS_ID: 'NEW' });
        transport.batch.company.update('company_fields', 7, {
            TITLE: 'ООО Тест',
        });
        // маркер анти-двойного исполнения — ПЕРВАЯ команда пишущего батча
        transport.batch.task.commentAdd('marker_task_11', 11, {
            AUTHOR_ID: 1,
            POST_MESSAGE: '[evflow:op-1]',
        });
        transport.batch.task.update('update_task_11', 11, { TITLE: 'перенос' });
        transport.batch.task.complete('complete_task_11', 11);
        transport.batch.task.add('add_task', {
            TITLE: 'Звонок',
            RESPONSIBLE_ID: 1,
        });
        transport.batch.checklistItem.add('add_task_checklist_0', {
            TASKID: '$result[add_task][task][id]',
            FIELDS: { TITLE: 'Пункт', PARENT_ID: 0 },
        });
        transport.batch.timeline.addTimelineComment('add_history_7', {
            ENTITY_TYPE: 'company',
            ENTITY_ID: 7,
            COMMENT: 'история',
        });
        transport.batch.listItem.add('add_pres_list_0', {
            IBLOCK_ID: '79',
            ELEMENT_CODE: 'presentation_7_x_0',
            FIELDS: { NAME: 'Презентация состоялась' },
        });
        transport.batch.listItem.update('upd_list_item_kpi_x', {
            IBLOCK_ID: '77',
            ELEMENT_ID: 5,
            FIELDS: { NAME: 'Продажа' },
        });
        transport.batch.lead.getField('uf_def_9', 9);

        expect(fake.calls.map(call => [call.method, call.args[0]])).toEqual([
            ['batch.company.get', 'get_company'],
            ['batch.deal.getList', 'list_deals'],
            ['batch.lead.get', 'get_owner_lead'],
            ['batch.contact.get', 'get_report_contact'],
            ['batch.deal.set', 'create_pres_deal'],
            ['batch.lead.update', 'lr_sync_upd_42'],
            ['batch.company.update', 'company_fields'],
            ['batch.task.commentAdd', 'marker_task_11'],
            ['batch.task.update', 'update_task_11'],
            ['batch.task.complete', 'complete_task_11'],
            ['batch.task.add', 'add_task'],
            ['batch.checklistItem.add', 'add_task_checklist_0'],
            ['batch.timeline.addTimelineComment', 'add_history_7'],
            ['batch.listItem.add', 'add_pres_list_0'],
            ['batch.listItem.update', 'upd_list_item_kpi_x'],
            ['batch.lead.getField', 'uf_def_9'],
        ]);
        // select/фильтры доехали без искажений
        expect(fake.calls[1]?.args).toEqual([
            'list_deals',
            { COMPANY_ID: '7' },
            ['ID', 'STAGE_ID'],
            undefined,
        ]);
        expect(fake.calls[2]?.args).toEqual(['get_owner_lead', 42, ['ID']]);
    });

    it('А4-методы задач передают аргументы без искажений ($result-ссылки живы)', () => {
        const { fake, transport } = setup();

        transport.batch.task.add('add_task', {
            TITLE: 'Позвонить после события',
            RESPONSIBLE_ID: 7,
            DEADLINE: '2026-09-01T10:00:00',
            UF_CRM_TASK: ['CO_5'],
        });
        transport.batch.task.complete('complete_task_11', 11);
        transport.batch.task.commentAdd('comment_task_11', 11, {
            AUTHOR_ID: 7,
            POST_MESSAGE: '[evflow:op-1] итог',
        });
        transport.batch.checklistItem.add('add_task_checklist_0', {
            TASKID: '$result[add_task][task][id]',
            FIELDS: { TITLE: 'Пункт', SORT_INDEX: 100 },
        });
        transport.batch.listItem.update('upd_list_item_kpi_x', {
            IBLOCK_ID: '77',
            ELEMENT_CODE: 'ev_success_7',
            FIELDS: { NAME: 'Продажа' },
        });

        expect(fake.calls).toEqual([
            {
                method: 'batch.task.add',
                args: [
                    'add_task',
                    {
                        TITLE: 'Позвонить после события',
                        RESPONSIBLE_ID: 7,
                        DEADLINE: '2026-09-01T10:00:00',
                        UF_CRM_TASK: ['CO_5'],
                    },
                ],
            },
            { method: 'batch.task.complete', args: ['complete_task_11', 11] },
            {
                method: 'batch.task.commentAdd',
                args: [
                    'comment_task_11',
                    11,
                    { AUTHOR_ID: 7, POST_MESSAGE: '[evflow:op-1] итог' },
                ],
            },
            {
                method: 'batch.checklistItem.add',
                args: [
                    'add_task_checklist_0',
                    {
                        TASKID: '$result[add_task][task][id]',
                        FIELDS: { TITLE: 'Пункт', SORT_INDEX: 100 },
                    },
                ],
            },
            {
                method: 'batch.listItem.update',
                args: [
                    'upd_list_item_kpi_x',
                    {
                        IBLOCK_ID: '77',
                        ELEMENT_CODE: 'ev_success_7',
                        FIELDS: { NAME: 'Продажа' },
                    },
                ],
            },
        ]);
    });
});

describe('BitrixFlowTransport: flush-примитив', () => {
    it('шлёт накопленный cmdBatch одним callBatch и отдаёт нормализованные чанки', async () => {
        const { fake, transport } = setup();
        transport.batch.deal.update('update_deal_10', 10, {});
        fake.respondWith({ update_deal_10: true });

        const chunks = await transport.flush();

        expect(fake.callBatch).toHaveBeenCalledTimes(1);
        expect(chunks).toEqual([
            {
                result: { update_deal_10: true },
                result_error: [],
                result_total: [],
                result_next: [],
            },
        ]);
    });

    it('пустой cmdBatch — no-op и [] (JSSDK_BATCH_EMPTY не наш случай, хвост use-case ждёт [])', async () => {
        const { fake, transport } = setup();
        await expect(transport.flush()).resolves.toEqual([]);
        expect(fake.callBatch).not.toHaveBeenCalled();
    });

    it('повторный flush после ответа снова no-op: cmdBatch очищен отправкой', async () => {
        const { fake, transport } = setup();
        transport.batch.deal.update('u1', 1, {});
        fake.respondWith({ u1: true });
        expect(await transport.flush()).toHaveLength(1);
        expect(await transport.flush()).toEqual([]);
        expect(fake.callBatch).toHaveBeenCalledTimes(1);
    });

    it('getCmdBatch отдаёт живую ссылку на cmdBatch сервиса (гигиена буфера)', () => {
        const { fake, transport } = setup();
        transport.batch.deal.update('u1', 1, {});
        const alive = transport.getCmdBatch();
        expect(Object.keys(alive)).toEqual(['u1']);
        // именно живая ссылка, не копия
        transport.batch.deal.update('u2', 2, {});
        expect(Object.keys(alive)).toEqual(['u1', 'u2']);
        expect(alive).toBe(fake.cmdBatch);
    });
});

describe('BitrixFlowTransport: под групповым буфером (сосед shared/batch)', () => {
    it('буфер материализует замыкания в cmdBatch и шлёт их через transport.flush', async () => {
        const { fake, transport } = setup();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        // так делает KpiListFlowService.flowDedup: кладёт в буфер замыкание,
        // зовущее bitrix.batch.listItem.* — здесь bitrix = транспорт
        buffer.queue(() =>
            transport.batch.listItem.add('add_list_item_kpi_x', {
                IBLOCK_ID: '77',
                ELEMENT_CODE: 'x',
                FIELDS: { NAME: 'Продажа' },
            }),
        );
        buffer.queue(() =>
            transport.batch.listItem.add('add_list_item_history_x', {
                IBLOCK_ID: '78',
                ELEMENT_CODE: 'x',
                FIELDS: { NAME: 'Продажа' },
            }),
        );
        // до flush команды живут замыканиями — cmdBatch не тронут
        expect(Object.keys(fake.cmdBatch)).toEqual([]);

        await buffer.endGroup();
        fake.respondWith({
            add_list_item_kpi_x: 5,
            add_list_item_history_x: 6,
        });
        await buffer.flush();

        expect(fake.callBatch).toHaveBeenCalledTimes(1);
        expect(
            fake.calls.filter(call => call.method === 'batch.listItem.add'),
        ).toHaveLength(2);
        expect(buffer.getResults()[0]?.result).toEqual({
            add_list_item_kpi_x: 5,
            add_list_item_history_x: 6,
        });
        expect(buffer.getOutcome().errors).toEqual([]);
    });
});

describe('BitrixFlowTransport: разбор ответа батча', () => {
    it('result_error логируется по каждой упавшей команде (halt=false)', async () => {
        const { fake, logger, transport } = setup();
        transport.batch.deal.update('ok_cmd', 1, {});
        transport.batch.deal.update('bad_cmd', 2, {});
        // dev-режим через бэк: честные чанки с result_error
        fake.respondWith([
            {
                result: { ok_cmd: true },
                result_error: {
                    bad_cmd: {
                        error: 'ACCESS_DENIED',
                        error_description: 'нет прав на сделку',
                    },
                },
                result_total: [],
                result_next: [],
            },
        ]);
        await transport.flush();

        expect(logger.errorMock).toHaveBeenCalledTimes(1);
        const message = String(logger.errorMock.mock.calls[0]?.[0]);
        expect(message).toContain('bad_cmd');
        expect(message).toContain('ACCESS_DENIED');
        // упавшая команда получила ответ (ошибкой) — «без ответа» не дублируется
        expect(logger.warnMock).not.toHaveBeenCalled();
    });

    it('оба источника ошибок складываются: result_error бэка + пропавшая команда фрейма', async () => {
        const { fake, logger, transport } = setup();
        transport.batch.deal.update('ok_cmd', 1, {});
        transport.batch.deal.update('bad_cmd', 2, {});
        transport.batch.deal.update('lost_cmd', 3, {});
        fake.respondWith([
            {
                result: { ok_cmd: true },
                result_error: {
                    bad_cmd: {
                        error: 'ACCESS_DENIED',
                        error_description: 'нет прав на сделку',
                    },
                },
                result_total: [],
                result_next: [],
            },
        ]);

        const chunks = await transport.flush();

        // Настоящий result_error остался как был, пропавшая команда приехала
        // отдельным чанком с NO_RESPONSE — вызывающий видит ОБЕ.
        expect(chunks).toHaveLength(2);
        expect(chunks[1]?.result_error).toEqual({
            lost_cmd: {
                error: 'NO_RESPONSE',
                error_description: expect.any(String),
            },
        });
        expect(String(logger.errorMock.mock.calls[0]?.[0])).toContain(
            'bad_cmd',
        );
        expect(
            logger.errorMock.mock.calls.some(call =>
                String(call[0]).includes('lost_cmd'),
            ),
        ).toBe(true);
    });
});

/**
 * ФРЕЙМОВАЯ форма ответа — та, на которой дефект и жил (MAJOR-2): b24jssdk
 * 2.0.0 с `returnAjaxResult:false` собирает в ответ ТОЛЬКО успешные команды
 * (`_extractBatchSimpleData`: `if (data.isSuccess)`), упавшая просто
 * отсутствует — ни результата, ни result_error. Прежние спеки моделировали
 * dev-режим (result_error объектом) и потому провал не ловили.
 */
describe('BitrixFlowTransport: фрейм прячет провал команды (MAJOR-2)', () => {
    it('выпавшая из плоской мапы команда едет НАСТОЯЩЕЙ ошибкой NO_RESPONSE', async () => {
        const { fake, logger, transport } = setup();
        transport.batch.company.update('update_entity_company_431', 431, {});
        transport.batch.lead.update('update_entity_lead_42', 42, {});
        // Фрейм: команда лида упала — её в ответе просто нет.
        fake.respondWith({ update_entity_company_431: true });

        const chunks = await transport.flush();

        expect(chunks).toEqual([
            {
                result: { update_entity_company_431: true },
                result_error: [],
                result_total: [],
                result_next: [],
            },
            {
                result: {},
                result_error: {
                    update_entity_lead_42: {
                        error: 'NO_RESPONSE',
                        error_description: expect.any(String),
                    },
                },
                result_total: [],
                result_next: [],
            },
        ]);
        expect(String(logger.errorMock.mock.calls[0]?.[0])).toContain(
            'update_entity_lead_42',
        );
    });

    it('под групповым буфером неотвеченная команда попадает в getOutcome().errors', async () => {
        const { fake, transport } = setup();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        buffer.queue(() =>
            transport.batch.listItem.add('add_list_item_kpi_x', {
                IBLOCK_ID: '77',
                ELEMENT_CODE: 'x',
                FIELDS: { NAME: 'Продажа' },
            }),
        );
        buffer.queue(() =>
            transport.batch.listItem.add('add_list_item_history_x', {
                IBLOCK_ID: '78',
                ELEMENT_CODE: 'x',
                FIELDS: { NAME: 'Продажа' },
            }),
        );
        await buffer.endGroup();
        fake.respondWith({ add_list_item_kpi_x: 5 });
        await buffer.flush();

        expect(buffer.getOutcome().errors).toEqual([
            {
                cmd: 'add_list_item_history_x',
                error: {
                    error: 'NO_RESPONSE',
                    error_description: expect.any(String),
                },
            },
        ]);
    });

    it('все команды отвечены — синтетического чанка нет и ошибок нет', async () => {
        const { fake, logger, transport } = setup();
        transport.batch.deal.update('u1', 1, {});
        transport.batch.deal.update('u2', 2, {});
        fake.respondWith({ u1: true, u2: true });

        const chunks = await transport.flush();

        expect(chunks).toHaveLength(1);
        expect(chunks[0]?.result_error).toEqual([]);
        expect(logger.errorMock).not.toHaveBeenCalled();
    });
});

/**
 * MINOR-2: пишущий батч дефолтного пути (буфер пуст — KPI выключен) уходил
 * ОДНИМ callBatch без проверки лимита, и Битрикс молча отбрасывал всё сверх
 * 50 команд. Теперь транспорт режет его сам — по связкам `$result[...]` и с
 * сохранением порядка.
 */
describe('BitrixFlowTransport: лимит 50 команд (MINOR-2)', () => {
    const queueMany = (
        transport: BitrixFlowTransport,
        count: number,
        from = 0,
    ): string[] => {
        const keys: string[] = [];
        for (let index = from; index < from + count; index += 1) {
            const cmd = `upd_${index}`;
            transport.batch.deal.update(cmd, index, {});
            keys.push(cmd);
        }
        return keys;
    };

    it('51 команда уезжает двумя последовательными callBatch, ответы склеены', async () => {
        const { fake, transport } = setup();
        const keys = queueMany(transport, 51);
        fake.respondEach([
            Object.fromEntries(keys.slice(0, 50).map(key => [key, true])),
            { [keys[50]!]: true },
        ]);

        const chunks = await transport.flush();

        expect(fake.callBatch).toHaveBeenCalledTimes(2);
        expect(fake.sent[0]).toHaveLength(50);
        expect(fake.sent[1]).toEqual([keys[50]]);
        // Порядок сохранён, ничего не потеряно и синтетических ошибок нет.
        expect(chunks).toHaveLength(2);
        expect(Object.keys(chunks[0]!.result)).toEqual(keys.slice(0, 50));
        expect(Object.keys(chunks[1]!.result)).toEqual([keys[50]]);
    });

    it('связка $result не рвётся: зависимая команда уезжает тем же чанком', async () => {
        const { fake, transport } = setup();
        // 49 обычных, затем add_task и 12 пунктов чек-листа со ссылкой на
        // него — связка целиком не влезает в остаток первого чанка.
        queueMany(transport, 49);
        transport.batch.task.add('add_task', {
            TITLE: 'Звонок',
            RESPONSIBLE_ID: 7,
        });
        for (let index = 0; index < 12; index += 1) {
            transport.batch.checklistItem.add(`add_task_checklist_${index}`, {
                TASKID: '$result[add_task][task][id]',
                FIELDS: { TITLE: `Пункт ${index}` },
            });
        }
        fake.respondEach([{}, {}]);

        await transport.flush();

        expect(fake.sent).toHaveLength(2);
        // Первый чанк — только независимые команды; связка целиком во втором.
        expect(fake.sent[0]).toHaveLength(49);
        expect(fake.sent[1]?.[0]).toBe('add_task');
        expect(fake.sent[1]).toHaveLength(13);
    });

    it('до лимита включительно — по-прежнему ОДИН callBatch', async () => {
        const { fake, transport } = setup();
        const keys = queueMany(transport, 50);
        fake.respondWith(Object.fromEntries(keys.map(key => [key, true])));

        await transport.flush();

        expect(fake.callBatch).toHaveBeenCalledTimes(1);
    });

    it('падение ПЕРВОГО чанка пробрасывается: не ушло ничего', async () => {
        const { fake, transport } = setup();
        queueMany(transport, 60);
        fake.failCall(1);

        await expect(transport.flush()).rejects.toThrow(/сеть упала/);
        // Гигиена: свои ключи из общего cmdBatch убраны — их не унесёт
        // первый же чужой callBatch.
        expect(Object.keys(fake.cmdBatch)).toEqual([]);
    });

    it('падение ВТОРОГО чанка не врёт «ничего не было»: остаток — NO_RESPONSE', async () => {
        const { fake, logger, transport } = setup();
        const keys = queueMany(transport, 60);
        fake.respondEach([
            Object.fromEntries(keys.slice(0, 50).map(key => [key, true])),
        ]);
        fake.failCall(2);

        const chunks = await transport.flush();

        // Первый чанк исполнен и отдан, остальные 10 команд — честные
        // ошибки, а не молчаливая потеря.
        expect(Object.keys(chunks[0]!.result)).toHaveLength(50);
        expect(Object.keys(chunks[1]!.result_error)).toEqual(keys.slice(50));
        expect(Object.keys(fake.cmdBatch)).toEqual([]);
        expect(
            logger.errorMock.mock.calls.some(call =>
                String(call[0]).includes('чанк 2/2'),
            ),
        ).toBe(true);
    });
});

describe('planBatchChunks', () => {
    const entries = (...keys: string[]): Array<[string, unknown]> =>
        keys.map(key => [key, { method: 'crm.deal.update', params: [] }]);

    it('независимые команды режутся по лимиту с сохранением порядка', () => {
        expect(planBatchChunks(entries('a', 'b', 'c', 'd', 'e'), 2)).toEqual([
            ['a', 'b'],
            ['c', 'd'],
            ['e'],
        ]);
    });

    it('связанные $result-ссылкой команды остаются в одном чанке', () => {
        const plan = planBatchChunks(
            [
                ['a', { params: [{}] }],
                ['b', { params: [{ REF: '$result[a]' }] }],
                ['c', { params: [{}] }],
            ],
            2,
        );

        expect(plan).toEqual([['a', 'b'], ['c']]);
    });

    it('связка тянет за собой ВСЁ, что между её концами: порядок не ломается', () => {
        // c ссылается на a — команда b, стоящая между ними, обязана уехать
        // тем же чанком, иначе её эффект переставится относительно соседей.
        const plan = planBatchChunks(
            [
                ['a', { params: [{}] }],
                ['b', { params: [{}] }],
                ['c', { params: [{ REF: '$result[a]' }] }],
                ['d', { params: [{}] }],
            ],
            3,
        );

        expect(plan).toEqual([['a', 'b', 'c'], ['d']]);
    });

    it('неделимая связка длиннее лимита — честная ошибка, а не тихая потеря', () => {
        expect(() =>
            planBatchChunks(
                [
                    ['a', { params: [{}] }],
                    ['b', { params: [{}] }],
                    ['c', { params: [{ REF: '$result[a]' }] }],
                ],
                2,
            ),
        ).toThrow(/атомарная отправка невозможна/);
    });

    it('ссылка на команду вне батча связкой не считается', () => {
        expect(
            planBatchChunks(
                [
                    ['a', { params: [{ REF: '$result[somewhere_else]' }] }],
                    ['b', { params: [{}] }],
                ],
                1,
            ),
        ).toEqual([['a'], ['b']]);
    });
});

describe('appendMissingCommandErrors', () => {
    const chunk = (result: Record<string, unknown>) => ({
        result,
        result_error: [] as [],
        result_total: [],
        result_next: [],
    });

    it('ключи без ответа — отдельным чанком NO_RESPONSE, в порядке отправки', () => {
        const { chunks, missing } = appendMissingCommandErrors(
            [chunk({ b: 1 })],
            ['a', 'b', 'c'],
        );

        expect(missing).toEqual(['a', 'c']);
        expect(chunks).toHaveLength(2);
        expect(Object.keys(chunks[1]!.result_error)).toEqual(['a', 'c']);
        // result синтетического чанка ПУСТ: счётчик команд, findBatchResult
        // и flattenResults работают ровно как раньше.
        expect(chunks[1]!.result).toEqual({});
    });

    it('команда с настоящим result_error ответом СЧИТАЕТСЯ (дубля нет)', () => {
        const { missing } = appendMissingCommandErrors(
            [
                {
                    result: {},
                    result_error: {
                        a: { error: 'ACCESS_DENIED', error_description: '-' },
                    },
                    result_total: [],
                    result_next: [],
                },
            ],
            ['a'],
        );

        expect(missing).toEqual([]);
    });

    it('все команды отвечены — чанки не трогаются', () => {
        const source = [chunk({ a: 1 })];
        const { chunks, missing } = appendMissingCommandErrors(source, ['a']);

        expect(missing).toEqual([]);
        expect(chunks).toBe(source);
    });
});

describe('BitrixFlowTransport: одиночные вызовы (call.*)', () => {
    it('dealGet заворачивает развёрнутый фронтовый ответ в бэковый конверт {result}', async () => {
        const { fake, transport } = setup();
        const response = await transport.call.dealGet(5, ['ID', 'COMPANY_ID']);
        expect(fake.dealGet).toHaveBeenCalledWith(5, ['ID', 'COMPANY_ID']);
        expect(response?.result).toEqual({ ID: 5, TITLE: 'сделка' });
    });

    it('dealGetList пробрасывает filter/select и отдаёт конверт как есть', async () => {
        const { fake, transport } = setup();
        const response = await transport.call.dealGetList(
            { COMPANY_ID: '7', CLOSED: 'N' },
            ['ID'],
        );
        expect(fake.dealGetList).toHaveBeenCalledWith(
            { COMPANY_ID: '7', CLOSED: 'N' },
            ['ID'],
            undefined,
        );
        expect(response?.result).toEqual([{ ID: 1 }]);
    });

    it('listItemGet пробрасывает dto дедупа (ELEMENT_CODE при IBLOCK_ID)', async () => {
        const { fake, transport } = setup();
        const dto = { IBLOCK_ID: '77', ELEMENT_CODE: 'ev_success_7' };
        await transport.call.listItemGet(dto);
        expect(fake.listItemGet).toHaveBeenCalledWith(dto);
    });

    it('leadGetFieldsList подставляет бэковый дефолт filter={} (фронт требует объект)', async () => {
        const { fake, transport } = setup();
        const response = await transport.call.leadGetFieldsList(undefined, [
            'ID',
            'FIELD_NAME',
        ]);
        expect(fake.leadGetFieldsList).toHaveBeenCalledWith({}, [
            'ID',
            'FIELD_NAME',
        ]);
        expect(response?.result?.[0]?.FIELD_NAME).toBe('UF_CRM_TO_SALE_DEAL');
    });
});

describe('BitrixFlowTransport: call-методы А4', () => {
    it('checklistItemGetList отдаёт конверт { result } как есть (task-flow читает response?.result)', async () => {
        const { fake, transport } = setup();
        const response = await transport.call.checklistItemGetList({
            TASKID: 11,
            ORDER: { SORT_INDEX: 'asc' },
        });
        expect(fake.checklistItemGetList).toHaveBeenCalledWith({
            TASKID: 11,
            ORDER: { SORT_INDEX: 'asc' },
        });
        expect(response?.result).toEqual([
            { ID: '431', TITLE: 'Чек-лист', IS_COMPLETE: 'N', SORT_INDEX: '0' },
        ]);
    });

    it('imNotifySystemAdd пробрасывает payload и отдаёт конверт с id уведомления', async () => {
        const { fake, transport } = setup();
        const response = await transport.call.imNotifySystemAdd({
            USER_ID: 1,
            MESSAGE: 'Звонок перенесён',
        });
        expect(fake.imNotifySystemAdd).toHaveBeenCalledWith({
            USER_ID: 1,
            MESSAGE: 'Звонок перенесён',
        });
        expect(response?.result).toBe(12345);
    });

    it('call-методы не трогают batch-аккумулятор', async () => {
        const { fake, transport } = setup();
        await transport.call.checklistItemGetList({ TASKID: 11 });
        await transport.call.imNotifySystemAdd({
            USER_ID: 1,
            MESSAGE: 'Звонок перенесён',
        });
        expect(Object.keys(fake.cmdBatch)).toEqual([]);
        expect(fake.callBatch).not.toHaveBeenCalled();
    });
});

describe('BitrixFlowTransport: синглтон Bitrix.getService', () => {
    it('без options.service берёт сервис из синглтона', async () => {
        const fake = createFakeService();
        getServiceMock.mockReturnValue(fake.service);
        const transport = new BitrixFlowTransport({
            logger: createFakeLogger(),
        });
        transport.batch.deal.update('u1', 1, {});
        fake.respondWith({ u1: true });
        await transport.flush();
        expect(getServiceMock).toHaveBeenCalledTimes(1);
        expect(fake.calls[0]?.method).toBe('batch.deal.update');
        expect(fake.callBatch).toHaveBeenCalledTimes(1);
    });

    it('синглтон пуст (Bitrix.start не вызван) — честная ошибка конструктора', () => {
        getServiceMock.mockReturnValue(undefined);
        expect(() => new BitrixFlowTransport()).toThrow(/Bitrix\.start/);
    });
});

describe('normalizeCallBatchResponse', () => {
    it('плоская мапа фрейма → один чанк с пустым result_error', () => {
        expect(normalizeCallBatchResponse({ cmd_a: 1 })).toEqual([
            {
                result: { cmd_a: 1 },
                result_error: [],
                result_total: [],
                result_next: [],
            },
        ]);
    });

    it('стандартный конверт проходит как единственный чанк', () => {
        const envelope = {
            result: { cmd_a: 1 },
            result_error: { cmd_b: { error: 'X', error_description: 'y' } },
            result_total: [],
            result_next: [],
        };
        expect(normalizeCallBatchResponse(envelope)).toEqual([envelope]);
    });

    it('массив чанков dev-режима дополняется недостающими полями', () => {
        expect(normalizeCallBatchResponse([{ result: { cmd_a: 1 } }])).toEqual([
            {
                result: { cmd_a: 1 },
                result_error: [],
                result_total: [],
                result_next: [],
            },
        ]);
    });

    it('не-объект → пусто', () => {
        expect(normalizeCallBatchResponse(null)).toEqual([]);
        expect(normalizeCallBatchResponse(undefined)).toEqual([]);
    });
});
