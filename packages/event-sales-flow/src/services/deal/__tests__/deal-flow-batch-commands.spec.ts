import { EventReportContext } from '../../context/event-report.context';
import { EventReportDealFlowService } from '../event-report-deal-flow.service';
import { SalesBaseDealService } from '../sales-base-deal.service';
import { SalesXoDealService } from '../sales-xo-deal.service';
import { TmcDealService } from '../tmc-deal.service';

/**
 * Состав batch-команд deal-сервисов на эталонном ctx (пакетная спека А2,
 * бэкового донора нет): адаптированные зеркала обязаны класть в транспорт
 * ТЕ ЖЕ cmd-ключи и параметры, что бэк кладёт в BitrixService, — на ключи
 * ссылаются `$result[...]`-чейны task/list-flow, а порядок команд задаёт
 * порядок исполнения внутри одного callBatch.
 *
 * Проверяются обе `$result`-строки deal-флоу: `$result[set_base_deal]`
 * (sales-base-deal:93) и `$result[set_pres_deal]` /
 * `$result[set_unplanned_pres_deal]` (sales-presentation-deal:135,172).
 */

type RecordedCall = { method: string; cmd: string; args: unknown[] };

/** Фейк порта FlowTransport: копит команды сделок по порядку постановки. */
const makeBitrix = () => {
    const calls: RecordedCall[] = [];
    const record =
        (method: string) =>
        (cmd: string, ...args: unknown[]) => {
            calls.push({ method, cmd, args });
        };
    const bitrix = {
        batch: {
            deal: {
                update: record('deal.update'),
                set: record('deal.set'),
                getList: record('deal.getList'),
            },
        },
    };
    return { calls, bitrix };
};

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

const makePortal = () => ({
    getTimezone: () => 'Europe/Moscow',
    getEntityFieldByCode: (_entity: string, code: string) =>
        code === 'pres_count'
            ? { bitrixId: 'PRES_COUNT', items: [] }
            : undefined,
    getFieldBitrixId: (field: { bitrixId: string }) =>
        `UF_CRM_${field.bitrixId}`,
    getPortal: () => ({ domain: 'd.b24.ru' }),
    getDealCategoryByCode: (code: string) => CATEGORIES[code],
});

/**
 * Эталонный ctx: компания-владелец, отчёт «презентация состоялась» по
 * текущей pres-сделке, план следующей презентации, живые base/pres/tmc.
 */
const makeCtx = (over: Record<string, unknown> = {}) =>
    new EventReportContext(
        {
            presentation: { isPresentationDone: true },
            currentTask: { eventType: 'presentation', name: 'ООО Ромашка' },
            report: { resultStatus: 'result' },
            plan: {
                isPlanned: true,
                isActive: true,
                name: 'ООО Ромашка',
                responsibility: { ID: 8 },
                type: { current: { code: 'presentation' } },
            },
            ...over,
        } as never,
        makePortal() as never,
        {
            entityType: 'company',
            entityId: 7,
            company: { ID: '7' },
            currentBaseDeal: { ID: '500', STAGE_ID: 'C17:WARM' },
            currentPresDeal: { ID: '900' },
            currentTmcDeal: { ID: '777' },
            ...((over.init as object) ?? {}),
        } as never,
        new Date('2026-08-10T09:00:00.000Z'),
    );

describe('EventReportDealFlowService — состав команд эталонного прогона', () => {
    it('4 команды по порядку: base → pres update → pres set → tmc; $result-связка pres→tmc', () => {
        const { calls, bitrix } = makeBitrix();
        const result = new EventReportDealFlowService(
            bitrix as never,
            makePortal() as never,
        ).queue(makeCtx());

        expect(calls.map(c => c.cmd)).toEqual([
            'update_base_deal_500',
            'update_pres_deal_900',
            'set_pres_deal',
            'update_tmc_to_pres_777',
        ]);

        // Основная: план презентации двигает на PRES, владелец привязан.
        const base = calls[0];
        expect(base.method).toBe('deal.update');
        expect(base.args[0]).toBe(500);
        expect(base.args[1]).toMatchObject({
            CATEGORY_ID: '17',
            STAGE_ID: 'C17:PRES',
            ASSIGNED_BY_ID: '8',
            COMPANY_ID: '7',
        });

        // Отчётная pres-сделка уезжает в «состоялась».
        expect(calls[1].method).toBe('deal.update');
        expect(calls[1].args[0]).toBe(900);
        expect(calls[1].args[1]).toMatchObject({ STAGE_ID: 'C48:WON' });

        // Новая плановая pres-сделка: TITLE из плана, стадия PLAN, связь с TMC.
        expect(calls[2].method).toBe('deal.set');
        expect(calls[2].args[0]).toMatchObject({
            TITLE: 'Презентация ООО Ромашка',
            CATEGORY_ID: '48',
            STAGE_ID: 'C48:PLAN',
            ASSIGNED_BY_ID: '8',
            COMPANY_ID: '7',
            UF_CRM_TO_BASE_TMC: '777',
        });

        // TMC привязывается к новой pres-сделке ЧЕРЕЗ $result-ссылку.
        expect(calls[3].method).toBe('deal.update');
        expect(calls[3].args[0]).toBe(777);
        expect(calls[3].args[1]).toMatchObject({
            CATEGORY_ID: '61',
            STAGE_ID: 'C61:PRES_PLAN',
            UF_CRM_TO_BASE_SALES: '500',
            UF_CRM_TO_PRESENTATION_SALES: '$result[set_pres_deal]',
            UF_CRM_LAST_PRES_DONE_RESPONSIBLE: '8',
            UF_CRM_MANAGER_OP: '8',
        });

        expect(result).toEqual({
            baseDealId: '500',
            newPlanPresDealId: '$result[set_pres_deal]',
            newUnplannedPresDealId: null,
        });
    });

    it('сделок нет: set-команды и $result-ссылки на все три новые сделки', () => {
        const { calls, bitrix } = makeBitrix();
        const result = new EventReportDealFlowService(
            bitrix as never,
            makePortal() as never,
        ).queue(
            makeCtx({
                init: {
                    currentBaseDeal: null,
                    currentPresDeal: null,
                    currentTmcDeal: null,
                },
            }),
        );

        // Отчёт «презентация состоялась» без живой pres-сделки трактуется
        // незапланированной — факт фиксируется set_unplanned_pres_deal.
        expect(calls.map(c => c.cmd)).toEqual([
            'set_base_deal',
            'set_pres_deal',
            'set_unplanned_pres_deal',
        ]);
        expect(calls[0].method).toBe('deal.set');
        expect(calls[0].args[0]).toMatchObject({
            CATEGORY_ID: '17',
            STAGE_ID: 'C17:PRES',
            ASSIGNED_BY_ID: '8',
        });
        expect(calls[2].args[0]).toMatchObject({
            TITLE: 'Презентация (незапланированная)',
            STAGE_ID: 'C48:WON',
        });

        expect(result).toEqual({
            baseDealId: '$result[set_base_deal]',
            newPlanPresDealId: '$result[set_pres_deal]',
            newUnplannedPresDealId: '$result[set_unplanned_pres_deal]',
        });
    });

    it('lead-владелец (isDealFlow=false): ни одной команды, нулевой результат', () => {
        const { calls, bitrix } = makeBitrix();
        const result = new EventReportDealFlowService(
            bitrix as never,
            makePortal() as never,
        ).queue(makeCtx({ init: { entityType: 'lead', entityId: 12 } }));

        expect(calls).toEqual([]);
        expect(result).toEqual({
            baseDealId: null,
            newPlanPresDealId: null,
            newUnplannedPresDealId: null,
        });
    });
});

describe('SalesXoDealService — состав команды', () => {
    it('холодный отчёт с результатом двигает ХО-сделку в success', () => {
        const { calls, bitrix } = makeBitrix();
        new SalesXoDealService(bitrix as never, makePortal() as never).queue(
            makeCtx({
                presentation: {},
                currentTask: { eventType: 'xo', name: 'Обзвон' },
                init: { currentXoDeal: { ID: '320' } },
            }),
        );

        expect(calls).toHaveLength(1);
        expect(calls[0].cmd).toBe('update_xo_deal_320');
        expect(calls[0].args[0]).toBe(320);
        expect(calls[0].args[1]).toMatchObject({
            CATEGORY_ID: '32',
            STAGE_ID: 'C32:WON',
            ASSIGNED_BY_ID: '8',
        });
    });

    it('без ХО-сделки команд нет', () => {
        const { calls, bitrix } = makeBitrix();
        new SalesXoDealService(bitrix as never, makePortal() as never).queue(
            makeCtx({ init: { currentXoDeal: null } }),
        );
        expect(calls).toEqual([]);
    });
});

describe('SalesBaseDealService — $result[set_base_deal]', () => {
    it('без базовой сделки возвращает $result-ссылку той же cmd', () => {
        const { calls, bitrix } = makeBitrix();
        const ref = new SalesBaseDealService(
            bitrix as never,
            makePortal() as never,
        ).queue(makeCtx({ init: { currentBaseDeal: null } }));

        expect(calls.map(c => c.cmd)).toEqual(['set_base_deal']);
        expect(ref).toBe('$result[set_base_deal]');
    });

    it('isPostSale: команд нет, идентификатор null', () => {
        const { calls, bitrix } = makeBitrix();
        const ref = new SalesBaseDealService(
            bitrix as never,
            makePortal() as never,
        ).queue(makeCtx({ isPostSale: true }));

        expect(calls).toEqual([]);
        expect(ref).toBeNull();
    });
});

describe('TmcDealService — закрытие по отчёту презентации', () => {
    it('closeTarget приоритетно из currentTmcFromPresentation; стадия fail', () => {
        const { calls, bitrix } = makeBitrix();
        new TmcDealService(bitrix as never, makePortal() as never).queue(
            makeCtx({
                presentation: {},
                plan: { responsibility: { ID: 8 } },
                report: {
                    resultStatus: 'result',
                    workStatus: { current: { code: 'fail' } },
                },
                init: {
                    currentPresDeal: { ID: '900' },
                    currentTmcDeal: { ID: '777' },
                    currentTmcFromPresentation: {
                        ID: '778',
                        STAGE_ID: 'C61:PRES_IN_PROGRESS',
                    },
                },
            }),
            null,
        );

        expect(calls).toHaveLength(1);
        expect(calls[0].cmd).toBe('close_tmc_778');
        expect(calls[0].args[0]).toBe(778);
        expect(calls[0].args[1]).toMatchObject({ STAGE_ID: 'C61:LOSE' });
    });

    it('возврат в ТМЦ активен — воронку не трогаем', () => {
        const { calls, bitrix } = makeBitrix();
        new TmcDealService(bitrix as never, makePortal() as never).queue(
            makeCtx({ returnToTmc: { isActive: true } }),
            '$result[set_pres_deal]',
        );
        expect(calls).toEqual([]);
    });
});
