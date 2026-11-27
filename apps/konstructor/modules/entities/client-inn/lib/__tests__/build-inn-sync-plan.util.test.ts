import { describe, expect, it } from 'vitest';
import {
    buildInnPatches,
    buildInnSyncPlan,
    type InnSyncInput,
} from '../build-inn-sync-plan.util';

type Fields = InnSyncInput['companyFields'];

const INN_A = '7707083893';
const INN_B = '5001007329';

const dealFields = [
    { code: 'op_inn', bitrixId: 'OP_INN_D' },
    { code: 'op_inn_pool', bitrixId: 'OP_INN_POOL_D' },
] as unknown as Fields;
const companyFields = [
    { code: 'op_inn', bitrixId: 'OP_INN' },
    { code: 'op_inn_pool', bitrixId: 'OP_INN_POOL' },
] as unknown as Fields;

const input = (overrides: Partial<InnSyncInput> = {}): InnSyncInput => ({
    requisiteInn: INN_B,
    domain: 'gsr.bitrix24.ru',
    userId: 447,
    deal: { ID: 129487, UF_CRM_OP_INN_D: INN_A, UF_CRM_OP_INN_POOL_D: [INN_A] },
    dealFields,
    company: { ID: 7, UF_CRM_OP_INN: INN_A, UF_CRM_OP_INN_POOL: [INN_A] },
    companyFields,
    ...overrides,
});

describe('buildInnSyncPlan', () => {
    it('новый ИНН реквизита: запрос на запись в сделку и компанию', () => {
        const plan = buildInnSyncPlan(input());
        expect(plan?.request).toEqual({
            domain: 'gsr.bitrix24.ru',
            inn: INN_B,
            dealId: 129487,
            companyId: 7,
            userId: 447,
        });
    });

    it('ИНН реквизита уже текущий и лежит в пуле: писать нечего', () => {
        expect(buildInnSyncPlan(input({ requisiteInn: INN_A }))).toBeNull();
    });

    it('текущий совпал, а в пуле ИНН нет: пул всё равно дописывается', () => {
        const plan = buildInnSyncPlan(
            input({
                requisiteInn: INN_A,
                deal: { ID: 129487, UF_CRM_OP_INN_D: INN_A, UF_CRM_OP_INN_POOL_D: [] },
                company: { ID: 7, UF_CRM_OP_INN: INN_A, UF_CRM_OP_INN_POOL: [INN_A] },
            }),
        );
        expect(plan?.request.inn).toBe(INN_A);
        expect(plan?.deal?.pool).toEqual([]);
    });

    it('ИНН не проходит контрольную сумму или пуст: плана нет, бэк такой ИНН отклонил бы', () => {
        expect(buildInnSyncPlan(input({ requisiteInn: '7707083894' }))).toBeNull();
        expect(buildInnSyncPlan(input({ requisiteInn: null }))).toBeNull();
    });

    it('без домена или без полей ИНН на портале писать некуда', () => {
        expect(buildInnSyncPlan(input({ domain: null }))).toBeNull();
        expect(
            buildInnSyncPlan(
                input({
                    dealFields: [] as unknown as Fields,
                    companyFields: [] as unknown as Fields,
                }),
            ),
        ).toBeNull();
    });

    it('работа из компании без сделки: запрос только по компании', () => {
        const plan = buildInnSyncPlan(input({ deal: null }));
        expect(plan?.request).toEqual({
            domain: 'gsr.bitrix24.ru',
            inn: INN_B,
            companyId: 7,
            userId: 447,
        });
        expect(plan?.deal).toBeNull();
    });

    it('поля пула нет на портале: сверяем только текущий ИНН', () => {
        const noPool = [{ code: 'op_inn', bitrixId: 'OP_INN' }] as unknown as Fields;
        expect(
            buildInnSyncPlan(
                input({
                    requisiteInn: INN_A,
                    deal: null,
                    companyFields: noPool,
                    company: { ID: 7, UF_CRM_OP_INN: INN_A },
                }),
            ),
        ).toBeNull();
    });
});

describe('buildInnPatches', () => {
    it('ИНН лёг в сделку: правим сделку и компанию, пул пополнен без потерь', () => {
        const plan = buildInnSyncPlan(input())!;
        expect(buildInnPatches(plan, 'deal')).toEqual({
            deal: { UF_CRM_OP_INN_D: INN_B, UF_CRM_OP_INN_POOL_D: [INN_A, INN_B] },
            company: { UF_CRM_OP_INN: INN_B, UF_CRM_OP_INN_POOL: [INN_A, INN_B] },
        });
    });

    it('сделка закрыта и ИНН лёг только в компанию: сделку не трогаем', () => {
        const plan = buildInnSyncPlan(input())!;
        expect(buildInnPatches(plan, 'company').deal).toBeNull();
        expect(buildInnPatches(plan, 'company').company).not.toBeNull();
    });

    it('ИНН лёг в заявку: в сторе ничего не меняем', () => {
        const plan = buildInnSyncPlan(input())!;
        expect(buildInnPatches(plan, 'lead')).toEqual({ deal: null, company: null });
    });
});
