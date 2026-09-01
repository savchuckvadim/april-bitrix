import { queueInitReads } from '../load-context.query';
import { EventReportInitService } from '../event-report-init.service';
import { FlowLogger } from '../../../ports/flow-logger.port';

/**
 * Состав ЧИТАЮЩЕГО батча init-фазы на фейках порта (пакетная спека А2,
 * бэкового донора нет): раскол load-context.query / resolve-context обязан
 * класть в транспорт ТЕ ЖЕ команды под теми же cmd-ключами, что бэковый
 * `loadContext`, — по ключам их потом разбирает `resolveInitContext`.
 * Сквозной кейс фасада закрепляет бэковый порядок «постановка чтений →
 * flush → сборка ctx».
 */

type RecordedCall = { method: string; args: unknown[] };

const makeBitrix = (
    opts: {
        ownerDeal?: Record<string, unknown> | null;
        ownerDealError?: boolean;
        flushResult?: Record<string, unknown>;
    } = {},
) => {
    const calls: RecordedCall[] = [];
    const record =
        (method: string) =>
        (...args: unknown[]) => {
            calls.push({ method, args });
        };
    const bitrix = {
        batch: {
            company: { get: record('company.get') },
            lead: { get: record('lead.get') },
            deal: { getList: record('deal.getList') },
            contact: { get: record('contact.get') },
        },
        call: {
            dealGet: (dealId: number) => {
                calls.push({ method: 'call.dealGet', args: [dealId] });
                return opts.ownerDealError
                    ? Promise.reject(new Error('ACCESS_DENIED'))
                    : Promise.resolve({ result: opts.ownerDeal ?? null });
            },
        },
        flush: () => {
            calls.push({ method: 'flush', args: [] });
            return Promise.resolve([
                {
                    result: opts.flushResult ?? {},
                    result_error: {},
                    result_total: [],
                    result_next: [],
                },
            ]);
        },
    };
    return { calls, bitrix };
};

const makePortal = () => ({
    getEntityFieldByCode: (_entity: string, code: string) => {
        if (code === 'pres_count') return { bitrixId: 'PRES_COUNT', items: [] };
        if (code === 'deal_joined_leads')
            return { bitrixId: 'DEAL_JOINED_LEADS', items: [] };
        return undefined;
    },
    getFieldBitrixId: (field: { bitrixId: string }) =>
        `UF_CRM_${field.bitrixId}`,
    getPortal: () => ({ domain: 'd.b24.ru' }),
    getTimezone: () => 'Europe/Moscow',
    getDealCategories: () => [
        { bitrixId: 14, code: 'sales_base' },
        { bitrixId: 20, code: 'sales_xo' },
    ],
    getDealCategoryByCode: (code: string) =>
        code === 'sales_base' ? { bitrixId: 14, code: 'sales_base' } : undefined,
});

const makeLogger = () => {
    const warns: unknown[][] = [];
    const logs: unknown[][] = [];
    const logger: FlowLogger = {
        log: (...args: unknown[]) => void logs.push(args),
        warn: (...args: unknown[]) => void warns.push(args),
        error: () => undefined,
    };
    return { logger, warns, logs };
};

const cmdsOf = (calls: RecordedCall[]) =>
    calls
        .filter(c => c.method !== 'call.dealGet' && c.method !== 'flush')
        .map(c => c.args[0]);

describe('queueInitReads — якорь-компания', () => {
    it('get_company + list_deals по COMPANY_ID; контакты дедуплицируются', async () => {
        const { calls, bitrix } = makeBitrix();
        const { logger } = makeLogger();
        const read = await queueInitReads(
            {
                context: { companyId: 431 },
                report: { contact: { ID: 5 } },
                plan: { contact: { ID: '5' } },
            } as never,
            bitrix as never,
            makePortal() as never,
            logger,
        );

        expect(cmdsOf(calls)).toEqual([
            'get_company',
            'list_deals',
            'get_report_contact',
        ]);
        const listDeals = calls.find(c => c.method === 'deal.getList');
        expect(listDeals?.args[1]).toEqual({ COMPANY_ID: 431 });
        // Select резолвится по слепку: накопительные поля обязаны приехать.
        const select = listDeals?.args[2] as string[];
        expect(select).toEqual(expect.arrayContaining(['ID', 'CLOSED']));
        expect(select).toContain('UF_CRM_TO_BASE_SALES');
        expect(select).toContain('UF_CRM_PRES_COUNT');

        expect(read).toMatchObject({
            entityId: 431,
            entityType: 'company',
            launchDealId: null,
            ownerDeal: null,
            ownerLeadIds: [],
            dtoLeadId: null,
            reportContactId: 5,
            planContactId: 5,
        });
    });

    it('context.dealId при якоре-компании: владелец читается call.dealGet ДО батча', async () => {
        const { calls, bitrix } = makeBitrix({
            ownerDeal: { ID: '5512', LEAD_ID: '318051' },
        });
        const { logger } = makeLogger();
        const read = await queueInitReads(
            { context: { companyId: 431, dealId: 5512 } } as never,
            bitrix as never,
            makePortal() as never,
            logger,
        );

        expect(calls[0]).toEqual({ method: 'call.dealGet', args: [5512] });
        // Ветка компании: сделки — по COMPANY_ID, без lead-добора.
        expect(cmdsOf(calls)).toEqual(['get_company', 'list_deals']);
        expect(read).toMatchObject({
            launchDealId: 5512,
            ownerDeal: { ID: '5512' },
            ownerLeadIds: [318051],
        });
    });
});

describe('queueInitReads — якорь-сделка', () => {
    it('добор по D_-ссылкам задачи, to_*-полям и общим лидам владельца', async () => {
        const { calls, bitrix } = makeBitrix({
            ownerDeal: {
                ID: '5512',
                LEAD_ID: '318051',
                UF_CRM_TO_BASE_TMC: '777',
                UF_CRM_DEAL_JOINED_LEADS: ['L_400'],
            },
        });
        const { logger } = makeLogger();
        await queueInitReads(
            {
                context: { dealId: 5512 },
                currentTask: { ufCrmTask: ['D_900', 'C_1', 'D_5512'] },
                lead: { ID: 318051 },
            } as never,
            bitrix as never,
            makePortal() as never,
            logger,
        );

        expect(cmdsOf(calls)).toEqual([
            'list_deals',
            'list_deals_by_lead',
            'get_dto_lead',
        ]);
        const [listDeals, listByLead] = calls.filter(
            c => c.method === 'deal.getList',
        );
        // Сама сделка + D_-ссылки задачи (без дубля entityId) + to_*-ссылки.
        expect(listDeals.args[1]).toEqual({ ID: [5512, 900, 777] });
        // Лиды владельца: стандартный LEAD_ID + deal_joined_leads (L_-формат).
        expect(listByLead.args[1]).toEqual({ LEAD_ID: [318051, 400] });
        // get_owner_lead не ставится: первичный лид совпал с dto.lead.
        const dtoLead = calls.find(c => c.method === 'lead.get');
        expect(dtoLead?.args).toEqual(['get_dto_lead', 318051]);
    });

    it('без dto.lead первичный лид владельца читается как get_owner_lead', async () => {
        const { calls, bitrix } = makeBitrix({
            ownerDeal: { ID: '5512', LEAD_ID: '318051' },
        });
        const { logger } = makeLogger();
        await queueInitReads(
            { context: { dealId: 5512 } } as never,
            bitrix as never,
            makePortal() as never,
            logger,
        );

        expect(cmdsOf(calls)).toEqual([
            'list_deals',
            'list_deals_by_lead',
            'get_owner_lead',
        ]);
        const ownerLead = calls.find(c => c.method === 'lead.get');
        expect(ownerLead?.args).toEqual(['get_owner_lead', 318051]);
    });

    it('падение чтения владельца не роняет init: warn и батч без lead-добора', async () => {
        const { calls, bitrix } = makeBitrix({ ownerDealError: true });
        const { logger, warns } = makeLogger();
        const read = await queueInitReads(
            { context: { dealId: 5512 } } as never,
            bitrix as never,
            makePortal() as never,
            logger,
        );

        expect(read.ownerDeal).toBeNull();
        expect(warns.length).toBe(1);
        expect(String(warns[0][0])).toContain('owner deal load failed');
        const listDeals = calls.find(c => c.method === 'deal.getList');
        expect(listDeals?.args[1]).toEqual({ ID: [5512] });
        expect(cmdsOf(calls)).toEqual(['list_deals']);
    });
});

describe('queueInitReads — якорь-лид и ошибки', () => {
    it('лид: get_lead_entity + list_deals по LEAD_ID, без дубля get_dto_lead', async () => {
        const { calls, bitrix } = makeBitrix();
        const { logger } = makeLogger();
        const read = await queueInitReads(
            { context: { leadId: 318051 }, lead: { ID: 318051 } } as never,
            bitrix as never,
            makePortal() as never,
            logger,
        );

        expect(cmdsOf(calls)).toEqual(['get_lead_entity', 'list_deals']);
        const listDeals = calls.find(c => c.method === 'deal.getList');
        expect(listDeals?.args[1]).toEqual({ LEAD_ID: 318051 });
        expect(read).toMatchObject({
            entityId: 318051,
            entityType: 'lead',
            dtoLeadId: 318051,
        });
    });

    it('нерезолвящийся якорь — честная ошибка', async () => {
        const { bitrix } = makeBitrix();
        const { logger } = makeLogger();
        await expect(
            queueInitReads(
                {} as never,
                bitrix as never,
                makePortal() as never,
                logger,
            ),
        ).rejects.toThrow(
            'EventReportInit: cannot resolve entityId from context/placement/lead',
        );
    });
});

describe('EventReportInitService.loadContext — сквозной порядок фасада', () => {
    it('постановка чтений → flush → сборка ctx (бэковый порядок)', async () => {
        const { calls, bitrix } = makeBitrix({
            flushResult: {
                get_company: { ID: '431', TITLE: 'ООО Ромашка' },
                list_deals: [
                    // Чужая открытая — не подхватывается (правило 25.08).
                    { ID: '100', CATEGORY_ID: '14', ASSIGNED_BY_ID: '3' },
                    // Своя открытая — становится базовой.
                    { ID: '250', CATEGORY_ID: '14', ASSIGNED_BY_ID: '8' },
                    // Закрытая отфильтровывается.
                    { ID: '300', CATEGORY_ID: '20', CLOSED: 'Y' },
                ],
            },
        });
        const ctx = await new EventReportInitService().loadContext(
            {
                context: { companyId: 431 },
                plan: { responsibility: { ID: 8 } },
            } as never,
            bitrix as never,
            makePortal() as never,
        );

        // flush уходит ПОСЛЕ всех команд постановки — как на бэке.
        expect(calls.map(c => c.method)).toEqual([
            'company.get',
            'deal.getList',
            'flush',
        ]);
        expect(ctx.entityId).toBe(431);
        expect(ctx.entityType).toBe('company');
        expect(ctx.company).toMatchObject({ ID: '431' });
        expect(ctx.currentBaseDeal?.ID).toBe('250');
        expect(ctx.currentXoDeal).toBeNull();
        expect(ctx.currentPresDeal).toBeNull();
        expect(ctx.reportContact).toBeNull();
    });
});
