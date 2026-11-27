import { beforeEach, describe, expect, it, vi } from 'vitest';
import { selectClientCard } from '@/modules/entities/client-card/model/selectors';
import { updateClientChoice } from '@/modules/entities/client-card/model/ClientCardThunk';
import { bxrqActions } from '@/modules/entities/bx-rq/model/BxRqSlice';
import {
    CONTRACT_RQ_GROUP,
    RQ_TYPE,
    type RqBundle,
    type RqRecord,
} from '@/modules/entities/bx-rq/model/types';
import { resetInnSyncMemory } from '@/modules/entities/client-inn/model/InnSyncThunk';
import {
    COMPANY_ID,
    loadDeal,
    loadPortal,
    makePortal,
    makePromptStore,
} from '@/modules/features/client-type-prompt/lib/__fixtures__/prompt-store';
import type { RootState } from '../../store';
import { setupInnSyncListener } from '../inn-sync.listener';

const api = vi.hoisted(() => ({ set: vi.fn(), update: vi.fn() }));
vi.mock('@/modules/entities/client-inn/lib/api/inn-set-helper', () => ({
    InnSetHelper: class {
        set = api.set;
    },
}));
vi.mock('@workspace/bitrix', async importOriginal => ({
    ...(await importOriginal<typeof import('@workspace/bitrix')>()),
    Bitrix: { getService: () => ({ company: { update: api.update } }) },
}));

const INN_OLD = '7707083893';
const INN_NEW = '5001007329';
const INN_FIZ = '500100732259';
const DEAL_ID = 129487;

const COMPANY_INN = 'UF_CRM_OP_INN';
const COMPANY_POOL = 'UF_CRM_OP_INN_POOL';
const DEAL_INN = 'UF_CRM_OP_INN_D';
const DEAL_POOL = 'UF_CRM_OP_INN_POOL_D';

/** Слепок портала: тип клиента из общей заготовки плюс поля ИНН у компании и сделки. */
const innPortal = () => {
    const portal = makePortal() as unknown as {
        company: { bitrixfields: unknown[] };
        bitrixDeal: { bitrixfields: unknown[] };
    };
    portal.company.bitrixfields.push(
        { code: 'op_inn', bitrixId: 'OP_INN', items: [] },
        { code: 'op_inn_pool', bitrixId: 'OP_INN_POOL', items: [] },
    );
    portal.bitrixDeal.bitrixfields.push(
        { code: 'op_inn', bitrixId: 'OP_INN_D', items: [] },
        { code: 'op_inn_pool', bitrixId: 'OP_INN_POOL_D', items: [] },
    );
    return portal as unknown as Parameters<typeof loadPortal>[1];
};

const rq = (id: number, type: RQ_TYPE, inn: string): RqRecord =>
    ({
        bx_id: id,
        type,
        fields: [
            {
                type: 'string',
                name: 'ИНН',
                value: inn,
                code: 'inn',
                isRequired: false,
                includes: [type],
                group: CONTRACT_RQ_GROUP.RQ,
                isActive: true,
                isDisable: false,
                order: 1,
            },
        ],
    }) as unknown as RqRecord;

const group = (type: RQ_TYPE.ORGANIZATION | RQ_TYPE.FIZ, items: RqRecord[]) => {
    const template = { bx_id: -1, type, fields: [] } as unknown as RqRecord;
    return { items: items.length ? items : [template], default: template };
};

const ORG_OLD = rq(1, RQ_TYPE.ORGANIZATION, INN_OLD);
const ORG_NEW = rq(2, RQ_TYPE.ORGANIZATION, INN_NEW);
const FIZ = rq(3, RQ_TYPE.FIZ, INN_FIZ);

const bundle = (): RqBundle =>
    ({
        [RQ_TYPE.ORGANIZATION]: group(RQ_TYPE.ORGANIZATION, [ORG_OLD, ORG_NEW]),
        [RQ_TYPE.IP]: group(RQ_TYPE.ORGANIZATION, []),
        [RQ_TYPE.FIZ]: group(RQ_TYPE.FIZ, [FIZ]),
        current: null,
    }) as unknown as RqBundle;

/** Сделка с ИНН ORG_OLD в сделке, компании и пулах; реквизиты загружены, текущий — ORG_OLD. */
const makeStore = () => {
    const { store, listenerMiddleware } = makePromptStore();
    setupInnSyncListener(listenerMiddleware);
    loadDeal(store, {
        company: { [COMPANY_INN]: INN_OLD, [COMPANY_POOL]: [INN_OLD] },
        deal: { [DEAL_INN]: INN_OLD, [DEAL_POOL]: [INN_OLD] },
    });
    loadPortal(store, innPortal());
    store.dispatch(bxrqActions.setFetched({ bxrq: bundle() }));
    store.dispatch(bxrqActions.setCurrentRqItems({ clientType: RQ_TYPE.ORGANIZATION, currentRqId: 1 }));
    return store;
};

const headerInn = (store: ReturnType<typeof makeStore>) =>
    selectClientCard(store.getState() as unknown as RootState).inn;

beforeEach(() => {
    resetInnSyncMemory();
    api.set.mockReset();
    api.set.mockResolvedValue({ inn: INN_NEW, entity: 'deal', warnings: [] });
    api.update.mockReset();
    api.update.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('текущий ИНН следует за текущими реквизитами', () => {
    it('загрузка сделки и реквизитов ничего не пишет, шапка показывает ИНН текущего реквизита', () => {
        const store = makeStore();
        expect(api.set).not.toHaveBeenCalled();
        expect(headerInn(store)).toBe(INN_OLD);
    });

    it('выбор другого реквизита: шапка меняется сразу, ИНН уходит на бэк, сторе обновлён', async () => {
        const store = makeStore();
        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_NEW }));

        // шапка не ждёт записи
        expect(headerInn(store)).toBe(INN_NEW);
        await vi.waitFor(() => expect(api.set).toHaveBeenCalledTimes(1));
        expect(api.set).toHaveBeenCalledWith({
            domain: 'gsr.bitrix24.ru',
            inn: INN_NEW,
            dealId: DEAL_ID,
            companyId: COMPANY_ID,
            userId: 447,
        });

        await vi.waitFor(() => {
            const { company, deal } = store.getState().app.bitrix as unknown as {
                company: Record<string, unknown>;
                deal: Record<string, unknown>;
            };
            expect(company[COMPANY_INN]).toBe(INN_NEW);
            expect(company[COMPANY_POOL]).toEqual([INN_OLD, INN_NEW]);
            expect(deal[DEAL_INN]).toBe(INN_NEW);
            expect(deal[DEAL_POOL]).toEqual([INN_OLD, INN_NEW]);
        });
    });

    /** Запись ИНН дошла и сущности в сторе обновлены. */
    const waitWritten = (store: ReturnType<typeof makeStore>, inn: string) =>
        vi.waitFor(() =>
            expect(
                (store.getState().app.bitrix.company as unknown as Record<string, unknown>)[
                    COMPANY_INN
                ],
            ).toBe(inn),
        );

    it('тот же реквизит выбран снова: ИНН уже текущий и в пуле, второй записи нет', async () => {
        const store = makeStore();
        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_NEW }));
        await waitWritten(store, INN_NEW);

        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_NEW }));
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(api.set).toHaveBeenCalledTimes(1);
    });

    it('возврат к прежнему реквизиту: текущий ИНН снова меняется, пул без дублей', async () => {
        const store = makeStore();
        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_NEW }));
        await waitWritten(store, INN_NEW);

        api.set.mockResolvedValue({ inn: INN_OLD, entity: 'deal', warnings: [] });
        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_OLD }));
        await waitWritten(store, INN_OLD);

        expect(api.set).toHaveBeenCalledTimes(2);
        expect(api.set.mock.calls[1]?.[0]).toMatchObject({ inn: INN_OLD });
        const company = store.getState().app.bitrix.company as unknown as Record<string, unknown>;
        expect(company[COMPANY_POOL]).toEqual([INN_OLD, INN_NEW]);
    });

    it('реквизит с ИНН, который уже текущий и лежит в пуле: ничего не пишем', async () => {
        const store = makeStore();
        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_OLD }));
        // слушатель успел бы вызвать запись, ждём его завершения
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(api.set).not.toHaveBeenCalled();
    });

    it('новый реквизит сохранён: он текущий, шапка и запись следуют за ним', async () => {
        const store = makeStore();
        const created = rq(77, RQ_TYPE.ORGANIZATION, INN_NEW);
        store.dispatch(
            bxrqActions.saveBaseCreating({ item: created, clientType: RQ_TYPE.ORGANIZATION }),
        );

        expect(headerInn(store)).toBe(INN_NEW);
        await vi.waitFor(() => expect(api.set).toHaveBeenCalledTimes(1));
        expect(api.set.mock.calls[0]?.[0]).toMatchObject({ inn: INN_NEW });
    });

    it('ИНН не проходит контрольную сумму: в шапке как введён, на бэк не уходит', async () => {
        const store = makeStore();
        const broken = rq(78, RQ_TYPE.ORGANIZATION, '7707083894');
        store.dispatch(
            bxrqActions.saveBaseCreating({ item: broken, clientType: RQ_TYPE.ORGANIZATION }),
        );

        expect(headerInn(store)).toBe('7707083894');
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(api.set).not.toHaveBeenCalled();
    });

    it('бэк без ручки записи: ответ 404 запоминается, повторных запросов нет, шапка работает', async () => {
        const store = makeStore();
        api.set.mockRejectedValue({ response: { status: 404 } });

        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_NEW }));
        await vi.waitFor(() => expect(api.set).toHaveBeenCalledTimes(1));
        expect(headerInn(store)).toBe(INN_NEW);

        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_OLD }));
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(api.set).toHaveBeenCalledTimes(1);
    });

    it('сбой записи не запоминается: следующая смена реквизита пробует снова', async () => {
        const store = makeStore();
        api.set.mockRejectedValueOnce(new Error('сеть'));

        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_NEW }));
        await vi.waitFor(() => expect(api.set).toHaveBeenCalledTimes(1));
        await vi.waitFor(() => expect(console.error).toHaveBeenCalled());

        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_OLD }));
        store.dispatch(bxrqActions.setCurrentItem({ item: ORG_NEW }));
        await vi.waitFor(() => expect(api.set.mock.calls.length).toBeGreaterThanOrEqual(2));
    });
});

describe('смена типа клиента', () => {
    /** Запись типа в компанию переключает реквизиты, как это делает слушатель реквизитов. */
    const switchRequisitesOnWrite = (store: ReturnType<typeof makeStore>) =>
        api.update.mockImplementation(async () => {
            store.dispatch(bxrqActions.setCurrentRqItems({ clientType: RQ_TYPE.FIZ }));
        });

    it('менеджер сменил тип: шапка показывает ИНН реквизита нового типа, он выравнивается в сделке', async () => {
        const store = makeStore();
        switchRequisitesOnWrite(store);
        api.set.mockResolvedValue({ inn: INN_FIZ, entity: 'deal', warnings: [] });

        await store.dispatch(updateClientChoice('clientType', 'fiz'));

        expect(headerInn(store)).toBe(INN_FIZ);
        await vi.waitFor(() => expect(api.set).toHaveBeenCalledTimes(1));
        expect(api.set.mock.calls[0]?.[0]).toMatchObject({ inn: INN_FIZ, dealId: DEAL_ID });
    });

    it('автоопределение типа при загрузке не пишет ИНН', async () => {
        const store = makeStore();
        switchRequisitesOnWrite(store);

        await store.dispatch(updateClientChoice('clientType', 'fiz', { syncInn: false }));

        expect(headerInn(store)).toBe(INN_FIZ);
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(api.set).not.toHaveBeenCalled();
    });

    it('у нового типа реквизитов нет: ИНН в шапке остаётся из компании, запись не нужна', async () => {
        const store = makeStore();
        api.update.mockImplementation(async () => {
            store.dispatch(bxrqActions.setCurrentRqItems({ clientType: RQ_TYPE.IP }));
        });

        await store.dispatch(updateClientChoice('clientType', 'ip'));

        expect(headerInn(store)).toBe(INN_OLD);
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(api.set).not.toHaveBeenCalled();
    });
});
