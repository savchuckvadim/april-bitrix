import { EventReportContext } from '../../context/event-report.context';
import { EventReportEntityFlowService } from '../event-report-entity-flow.service';

/**
 * Состав batch-команд entity-flow на фейке порта FlowTransport (пакетная
 * спека А2, бэкового донора нет): update сущности-владельца уходит в батч
 * под тем же cmd-ключом `update_entity_{type}_{id}` и в тот же домен
 * (company/deal/lead), что у бэка, а бэкфилл компании — ОТДЕЛЬНОЙ командой
 * `backfill_company_{id}` и первым (порядок постановки бэка).
 */

type RecordedCall = { method: string; cmd: string; args: unknown[] };

const makeBitrix = () => {
    const calls: RecordedCall[] = [];
    const record =
        (method: string) =>
        (cmd: string, ...args: unknown[]) => {
            calls.push({ method, cmd, args });
        };
    const bitrix = {
        batch: {
            deal: { update: record('deal.update') },
            company: { update: record('company.update') },
            lead: { update: record('lead.update') },
        },
    };
    return { calls, bitrix };
};

/** Слепок: pres_count установлен на всех сущностях, + пара полей бэкфилла. */
const makePortal = () => {
    const installed: Record<string, { bitrixId: string; type?: string; items: never[] }> = {
        'company.pres_count': { bitrixId: 'PRES_COUNT', items: [] },
        'lead.pres_count': { bitrixId: 'PRES_COUNT', items: [] },
        'deal.pres_count': { bitrixId: 'PRES_COUNT', items: [] },
        'deal.op_sale_date_prognoz': {
            bitrixId: 'SALE_PROGNOZ_D',
            type: 'string',
            items: [],
        },
        'company.op_sale_date_prognoz': {
            bitrixId: 'SALE_PROGNOZ_C',
            type: 'string',
            items: [],
        },
    };
    return {
        getTimezone: () => 'Europe/Moscow',
        getEntityFieldByCode: (entity: string, code: string) =>
            installed[`${entity}.${code}`],
        getFieldBitrixId: (field: { bitrixId: string }) =>
            `UF_CRM_${field.bitrixId}`,
        getFieldItemByCode: () => undefined,
        getPortal: () => ({ domain: 'd.b24.ru' }),
    };
};

/** Отчёт «презентация состоялась» — модель полей гарантированно непуста. */
const makeCtx = (over: Record<string, unknown> = {}) =>
    new EventReportContext(
        {
            presentation: { isPresentationDone: true },
            currentTask: { eventType: 'presentation', name: 'ООО Ромашка' },
            report: { resultStatus: 'result' },
            plan: { responsibility: { ID: 8 } },
            ...over,
        } as never,
        makePortal() as never,
        {
            entityType: 'company',
            entityId: 7,
            company: { ID: '7' },
            currentBaseDeal: null,
            ...((over.init as object) ?? {}),
        } as never,
        new Date('2026-08-10T09:00:00.000Z'),
    );

const run = (ctx: EventReportContext) => {
    const { calls, bitrix } = makeBitrix();
    new EventReportEntityFlowService(
        bitrix as never,
        makePortal() as never,
    ).queue(ctx);
    return calls;
};

describe('EventReportEntityFlowService — состав команд', () => {
    it('компания: update_entity_company_{id} в домен company с полями модели', () => {
        const calls = run(makeCtx());
        expect(calls.map(c => c.cmd)).toEqual(['update_entity_company_7']);
        expect(calls[0].method).toBe('company.update');
        expect(calls[0].args[0]).toBe(7);
        expect(calls[0].args[1]).toMatchObject({ UF_CRM_PRES_COUNT: 1 });
    });

    it('компания не догрузилась init-батчем — команды нет (graceful skip)', () => {
        const calls = run(makeCtx({ init: { company: null } }));
        expect(calls).toEqual([]);
    });

    it('лид-владелец: update_entity_lead_{id} в домен lead', () => {
        const calls = run(
            makeCtx({
                init: { entityType: 'lead', entityId: 12, lead: { ID: '12' } },
            }),
        );
        expect(calls.map(c => c.cmd)).toEqual(['update_entity_lead_12']);
        expect(calls[0].method).toBe('lead.update');
        expect(calls[0].args[0]).toBe(12);
    });

    it('сделка-владелец: update_entity_deal_{id} в домен deal', () => {
        const calls = run(
            makeCtx({
                init: {
                    entityType: 'deal',
                    entityId: 5512,
                    company: null,
                    ownerDeal: { ID: '5512' },
                },
            }),
        );
        expect(calls.map(c => c.cmd)).toEqual(['update_entity_deal_5512']);
        expect(calls[0].method).toBe('deal.update');
        expect(calls[0].args[0]).toBe(5512);
    });

    it('бэкфилл пустого поля компании со сделки — отдельной командой и первым', () => {
        const calls = run(
            makeCtx({
                init: {
                    company: { ID: '7' },
                    currentBaseDeal: {
                        ID: '500',
                        UF_CRM_SALE_PROGNOZ_D: '01.09.2026',
                    },
                },
            }),
        );
        expect(calls.map(c => c.cmd)).toEqual([
            'backfill_company_7',
            'update_entity_company_7',
        ]);
        expect(calls[0].method).toBe('company.update');
        expect(calls[0].args[0]).toBe(7);
        expect(calls[0].args[1]).toEqual({
            UF_CRM_SALE_PROGNOZ_C: '01.09.2026',
        });
    });

    it('значение у компании уже есть — бэкфилл молчит (не перезатираем)', () => {
        const calls = run(
            makeCtx({
                init: {
                    company: { ID: '7', UF_CRM_SALE_PROGNOZ_C: '15.08.2026' },
                    currentBaseDeal: {
                        ID: '500',
                        UF_CRM_SALE_PROGNOZ_D: '01.09.2026',
                    },
                },
            }),
        );
        expect(calls.map(c => c.cmd)).toEqual(['update_entity_company_7']);
    });
});
