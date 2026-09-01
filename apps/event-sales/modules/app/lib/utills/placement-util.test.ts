import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Батч сущностей плейсмента (Б3): DEAL и вторая ступень TASK ходят в Битрикс
 * ОДНИМ callBatch вместо 2–3 последовательных запросов.
 *
 * Что здесь защищается:
 * 1. DEAL: get_deal + get_company в одной пачке, компания цепляется через
 *    `$result[get_deal][COMPANY_ID]` — подстановку эмулирует мини-сервер
 *    ниже, как настоящий REST batch (по порядку, halt=0);
 * 2. сделка без компании — легальный контекст: company=null, не ошибка;
 * 3. TASK: task.get остаётся ПЕРВЫМ (без него привязки неизвестны), вторая
 *    ступень — один батч для всех трёх видов привязки (company | deal→company
 *    | lead); без привязок батча нет вовсе (пустая пачка запрещена);
 * 4. битые/пустые ответы и упавший транспорт → прежние fallback'и: null'ы
 *    без исключений, форма результата не меняется;
 * 5. общий cmdBatch синглтона: свои ключи зачищаются перед наполнением
 *    (упавший callBatch не очищает поле, addCmdBatchType не перезаписывает),
 *    успешный вызов оставляет cmdBatch пустым.
 *
 * Фейковый bitrix воспроизводит МЕХАНИКУ BitrixBaseApi (общее мутируемое поле
 * cmdBatch, «не перезаписывать существующий ключ», очистка после успешной
 * отправки), а разбор ответа идёт через НАСТОЯЩИЙ flattenBatchResults.
 */

const h = vi.hoisted(() => ({
    service: null as unknown,
}));

vi.mock('@workspace/bitrix', async () => {
    const { flattenBatchResults } = await vi.importActual<
        typeof import('@workspace/bitrix/src/core/lib/batch-result.util')
    >('@workspace/bitrix/src/core/lib/batch-result.util');
    return {
        Bitrix: { getService: () => h.service },
        flattenBatchResults,
    };
});

import type { Placement } from '@workspace/bx';
import { APP_FROM_ENUM } from '../../model/slice/AppSlice';
import { EVENT_TASK_SELECT } from '@/modules/entities/EventTask/lib/task-select';
import { getEntitiesFromPlacement } from './placement-util';

type BatchCmd = { method: string; params: Record<string, unknown> };

type FakeDb = {
    deals?: Record<number, Record<string, unknown>>;
    companies?: Record<number, Record<string, unknown>>;
    leads?: Record<number, Record<string, unknown>>;
};

/**
 * Мини-сервер batch Битрикса: команды строго по порядку, `$result[...]`
 * резолвится из уже выполненных, упавшая команда (нет строки / битый id /
 * нерезолвленная ссылка) при halt=0 просто отсутствует в ответе. Значения —
 * уже развёрнутые сущности: так отдают и фрейм, и бэк-прокси.
 */
const runServerBatch = (
    cmds: Record<string, BatchCmd>,
    db: FakeDb,
): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, { method, params }] of Object.entries(cmds)) {
        let rawId: unknown = params.ID;
        if (typeof rawId === 'string') {
            const ref = rawId.match(/^\$result\[([^\]]+)\]\[([^\]]+)\]$/);
            if (ref) {
                const source = result[ref[1]!] as
                    | Record<string, unknown>
                    | undefined;
                rawId = source?.[ref[2]!];
            }
        }
        const id = Number(rawId);
        const table =
            method === 'crm.deal.get'
                ? db.deals
                : method === 'crm.company.get'
                  ? db.companies
                  : method === 'crm.lead.get'
                    ? db.leads
                    : undefined;
        const row = id > 0 ? table?.[id] : undefined;
        if (row) result[key] = row;
    }
    return result;
};

const makeFakeBitrix = (db: FakeDb = {}) => {
    /** Живое общее поле, как cmdBatch в BitrixBaseApi. */
    const cmdBatch: Record<string, BatchCmd> = {};
    /** Снимки отправленных пачек — по одному на каждый успешный callBatch. */
    const sentBatches: Array<Record<string, BatchCmd>> = [];
    /** Подмена транспорта для сценария «сеть упала». */
    let transportFailure: Error | null = null;

    const add = (
        cmd: string,
        method: string,
        params: Record<string, unknown>,
    ) => {
        // Как addCmdBatchType: существующий ключ молча НЕ перезаписывается.
        if (!cmdBatch[cmd]) cmdBatch[cmd] = { method, params };
    };

    const service = {
        deal: { get: vi.fn() },
        company: { get: vi.fn() },
        lead: { get: vi.fn() },
        task: { get: vi.fn() },
        batch: {
            deal: {
                get: vi.fn(async (cmd: string, id: number | string) => {
                    add(cmd, 'crm.deal.get', { ID: id });
                }),
            },
            company: {
                get: vi.fn(async (cmd: string, id: number | string) => {
                    add(cmd, 'crm.company.get', { ID: id });
                }),
            },
            lead: {
                get: vi.fn(async (cmd: string, id: number | string) => {
                    add(cmd, 'crm.lead.get', { ID: id });
                }),
            },
        },
        api: {
            getCmdBatch: () => cmdBatch,
            callBatch: vi.fn(async () => {
                // Упавший транспорт НЕ очищает cmdBatch — как в оригинале,
                // где `this.cmdBatch = {}` стоит после await без finally.
                if (transportFailure) throw transportFailure;
                const snapshot = { ...cmdBatch };
                sentBatches.push(snapshot);
                for (const key of Object.keys(cmdBatch)) {
                    delete cmdBatch[key];
                }
                return runServerBatch(snapshot, db);
            }),
        },
    };

    return {
        service,
        cmdBatch,
        sentBatches,
        failTransport: (error: Error) => {
            transportFailure = error;
        },
    };
};

const DOMAIN = 'test.bitrix24.ru';

const dealPlacement = (id: number) =>
    ({
        placement: 'CRM_DEAL_DETAIL_TAB',
        options: { ID: id },
    }) as unknown as Placement;

const taskPlacement = (taskId: number) =>
    ({
        placement: 'TASK_VIEW_TAB',
        options: { taskId },
    }) as unknown as Placement;

const taskResponse = (ufCrmTask: string[]) => ({
    result: { task: { id: 501, title: 'Обзвон', ufCrmTask } },
});

afterEach(() => {
    h.service = null;
    vi.restoreAllMocks();
});

describe('getEntitiesFromPlacement: DEAL одним батчем', () => {
    it('сделка и компания приходят одной пачкой, компания — из $result-ссылки', async () => {
        const deal = { ID: '12', COMPANY_ID: '34', TITLE: 'Сделка' };
        const company = { ID: '34', TITLE: 'Компания' };
        const fake = makeFakeBitrix({
            deals: { 12: deal },
            companies: { 34: company },
        });
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            dealPlacement(12),
            DOMAIN,
        );

        // Ровно ОДИН раунд-трип — в этом весь смысл Б3.
        expect(fake.service.api.callBatch).toHaveBeenCalledTimes(1);
        expect(fake.sentBatches).toHaveLength(1);
        const sent = fake.sentBatches[0]!;
        expect(Object.keys(sent)).toEqual(['get_deal', 'get_company']);
        expect(sent.get_deal!.params.ID).toBe(12);
        // Компания цепляется к сделке ССЫЛКОЙ, а не вторым запросом.
        expect(sent.get_company!.params.ID).toBe(
            '$result[get_deal][COMPANY_ID]',
        );

        expect(result.currentDeal).toEqual(deal);
        expect(result.currentCompany).toEqual(company);
        expect(result.currentLead).toBeNull();
        expect(result.currentTask).toBeNull();
        expect(result.from).toBe(APP_FROM_ENUM.DEAL);

        // Последовательные одиночные запросы ушли в прошлое.
        expect(fake.service.deal.get).not.toHaveBeenCalled();
        expect(fake.service.company.get).not.toHaveBeenCalled();
        // Успешная отправка оставляет общий cmdBatch чистым.
        expect(fake.cmdBatch).toEqual({});
    });

    it('сделка без COMPANY_ID: company=null, не ошибка — ветка как раньше', async () => {
        const deal = { ID: '12', COMPANY_ID: '0', TITLE: 'Без компании' };
        const fake = makeFakeBitrix({ deals: { 12: deal } });
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            dealPlacement(12),
            DOMAIN,
        );

        expect(fake.service.api.callBatch).toHaveBeenCalledTimes(1);
        expect(result.currentDeal).toEqual(deal);
        expect(result.currentCompany).toBeNull();
        expect(result.from).toBe(APP_FROM_ENUM.DEAL);
    });
});

describe('getEntitiesFromPlacement: TASK — task.get первым, вторая ступень батчем', () => {
    it('привязка к компании: пачка из одной команды get_company', async () => {
        const company = { ID: '77', TITLE: 'Компания задачи' };
        const fake = makeFakeBitrix({ companies: { 77: company } });
        fake.service.task.get.mockResolvedValue(taskResponse(['CO_77']));
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            taskPlacement(501),
            DOMAIN,
        );

        // task.get — прежний, первым и с тем же select.
        expect(fake.service.task.get).toHaveBeenCalledWith(
            501,
            EVENT_TASK_SELECT,
        );
        expect(fake.service.task.get.mock.invocationCallOrder[0]).toBeLessThan(
            fake.service.api.callBatch.mock.invocationCallOrder[0]!,
        );

        expect(fake.sentBatches).toHaveLength(1);
        expect(fake.sentBatches[0]).toEqual({
            get_company: { method: 'crm.company.get', params: { ID: 77 } },
        });

        expect(result.currentTask).toMatchObject({ id: 501 });
        expect(result.currentCompany).toEqual(company);
        expect(result.currentDeal).toBeNull();
        expect(result.from).toBe(APP_FROM_ENUM.COMPANY);
        expect(fake.service.company.get).not.toHaveBeenCalled();
    });

    it('привязка к сделке: get_deal + get_company одной пачкой через $result', async () => {
        const deal = { ID: '55', COMPANY_ID: '34', TITLE: 'Сделка задачи' };
        const company = { ID: '34', TITLE: 'Компания сделки' };
        const fake = makeFakeBitrix({
            deals: { 55: deal },
            companies: { 34: company },
        });
        fake.service.task.get.mockResolvedValue(taskResponse(['D_55']));
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            taskPlacement(501),
            DOMAIN,
        );

        expect(fake.service.api.callBatch).toHaveBeenCalledTimes(1);
        const sent = fake.sentBatches[0]!;
        expect(Object.keys(sent)).toEqual(['get_deal', 'get_company']);
        expect(sent.get_deal!.params.ID).toBe(55);
        expect(sent.get_company!.params.ID).toBe(
            '$result[get_deal][COMPANY_ID]',
        );

        expect(result.currentDeal).toEqual(deal);
        expect(result.currentCompany).toEqual(company);
        expect(result.from).toBe(APP_FROM_ENUM.DEAL);
    });

    it('привязка к лиду: пачка из одной команды get_lead', async () => {
        const lead = { ID: '91', TITLE: 'Лид задачи' };
        const fake = makeFakeBitrix({ leads: { 91: lead } });
        fake.service.task.get.mockResolvedValue(taskResponse(['L_91']));
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            taskPlacement(501),
            DOMAIN,
        );

        expect(fake.sentBatches).toHaveLength(1);
        expect(fake.sentBatches[0]).toEqual({
            get_lead: { method: 'crm.lead.get', params: { ID: 91 } },
        });
        expect(result.currentLead).toEqual(lead);
        expect(result.currentCompany).toBeNull();
        expect(result.currentDeal).toBeNull();
        expect(result.from).toBe(APP_FROM_ENUM.LEAD);
        expect(fake.service.lead.get).not.toHaveBeenCalled();
    });

    it('задача без привязок: второй ступени нет — пустую пачку не отправляем', async () => {
        const fake = makeFakeBitrix();
        fake.service.task.get.mockResolvedValue(taskResponse([]));
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            taskPlacement(501),
            DOMAIN,
        );

        expect(fake.service.api.callBatch).not.toHaveBeenCalled();
        // Задача остаётся: на ней держится гвард noTaskEntity в app-init.
        expect(result.currentTask).toMatchObject({ id: 501 });
        expect(result.currentCompany).toBeNull();
        expect(result.currentDeal).toBeNull();
        expect(result.currentLead).toBeNull();
        expect(result.from).toBe(APP_FROM_ENUM.COMPANY);
    });
});

describe('getEntitiesFromPlacement: битые ответы и транспорт', () => {
    it('мусор в значениях команд → null-сущности без исключений', async () => {
        const fake = makeFakeBitrix();
        // Подменяем «сервер»: значения не-объекты и массив — битый ответ.
        fake.service.api.callBatch.mockResolvedValue({
            get_deal: 'FATAL',
            get_company: [{ ID: '34' }],
        });
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            dealPlacement(12),
            DOMAIN,
        );

        expect(result.currentDeal).toBeNull();
        expect(result.currentCompany).toBeNull();
        expect(result.from).toBe(APP_FROM_ENUM.DEAL);
    });

    it('упавший callBatch → прежний fallback: все null, без throw наружу', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const fake = makeFakeBitrix();
        fake.failTransport(new Error('network down'));
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            dealPlacement(12),
            DOMAIN,
        );

        expect(result.currentDeal).toBeNull();
        expect(result.currentCompany).toBeNull();
        expect(result.currentLead).toBeNull();
        expect(result.currentTask).toBeNull();
        // Ловится общим catch — как раньше падение deal.get.
        expect(result.from).toBe(APP_FROM_ENUM.COMPANY);
        expect(error).toHaveBeenCalled();
    });
});

describe('getEntitiesFromPlacement: гигиена общего cmdBatch', () => {
    it('свои протухшие ключи зачищаются: на ⟳ уходят свежие параметры', async () => {
        const deal = { ID: '12', COMPANY_ID: '0' };
        const fake = makeFakeBitrix({ deals: { 12: deal } });
        // Эмулируем упавший ранее callBatch: поле осталось грязным, а
        // addCmdBatchType существующий ключ не перезаписывает.
        fake.cmdBatch.get_deal = {
            method: 'crm.deal.get',
            params: { ID: 999 },
        };
        fake.cmdBatch.history_0 = {
            method: 'lists.element.get',
            params: { IBLOCK_ID: '1' },
        };
        h.service = fake.service;

        const result = await getEntitiesFromPlacement(
            dealPlacement(12),
            DOMAIN,
        );

        const sent = fake.sentBatches[0]!;
        // Свой ключ — со СВЕЖИМ id, а не с прошлогодним 999.
        expect(sent.get_deal!.params.ID).toBe(12);
        // Чужой ключ не трогаем: общее поле уходит целиком — это семантика
        // синглтона, и она тут зафиксирована осознанно.
        expect(sent.history_0).toBeDefined();
        expect(result.currentDeal).toEqual(deal);
    });
});
