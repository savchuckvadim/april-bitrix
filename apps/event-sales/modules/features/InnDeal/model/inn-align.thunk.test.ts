import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppDispatch, RootState } from '@/modules/app/model/store';

const h = vi.hoisted(() => ({ align: vi.fn() }));

vi.mock('../lib/api/inn-deal-helper', () => ({
    InnDealHelper: class {
        align = h.align;
    },
}));

import { alignDealInnOnOpen } from './inn-align.thunk';

/** Хранилище вкладки: тесты идут без браузера. */
const createSessionStorage = () => {
    const bag = new Map<string, string>();
    return {
        getItem: (key: string) => bag.get(key) ?? null,
        setItem: (key: string, value: string) => {
            bag.set(key, value);
        },
    };
};

const FIELDS = [
    { code: 'op_inn', bitrixId: 'OP_INN' },
    { code: 'op_inn_pool', bitrixId: 'OP_INN_POOL' },
];

const makeState = (over: {
    dealInn?: string;
    companyInn?: string;
    closed?: boolean;
    company?: boolean;
}): RootState =>
    ({
        app: {
            domain: 'garant.bitrix24.ru',
            bitrix: {
                deal: {
                    ID: '104459',
                    CLOSED: over.closed ? 'Y' : 'N',
                    UF_CRM_OP_INN: over.dealInn ?? '',
                },
                company:
                    over.company === false
                        ? null
                        : { ID: '161825', UF_CRM_OP_INN: over.companyInn ?? '' },
                lead: null,
            },
        },
        portal: {
            portal: {
                company: { bitrixfields: FIELDS },
                bitrixDeal: { bitrixfields: FIELDS },
                lead: { bitrixfields: FIELDS },
            },
        },
        inn: { savedValue: null },
    }) as unknown as RootState;

const run = async (state: RootState) => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const dispatch = ((action: { type: string; payload?: unknown }) =>
        actions.push(action)) as unknown as AppDispatch;
    await alignDealInnOnOpen()(dispatch, () => state);
    return actions;
};

beforeEach(() => {
    h.align.mockReset();
    vi.stubGlobal('window', { sessionStorage: createSessionStorage() });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('alignDealInnOnOpen', () => {
    it('ИНН пуст в сделке и компании — выравнивание, ответ сразу в шапку', async () => {
        h.align.mockResolvedValue({ current: '4703142743', warnings: [] });

        const actions = await run(makeState({}));

        expect(h.align).toHaveBeenCalledWith(104459, 'garant.bitrix24.ru');
        expect(actions).toEqual([
            { type: 'inn/syncValue', payload: { value: '4703142743' } },
        ]);
    });

    it('одна сделка — один вызов за вкладку', async () => {
        h.align.mockResolvedValue({ current: null, warnings: [] });
        const state = makeState({});

        await run(state);
        await run(state);

        expect(h.align).toHaveBeenCalledTimes(1);
    });

    it('заполнена только сделка — тоже зовём: компании допишется', async () => {
        h.align.mockResolvedValue({ current: '4703142743', warnings: [] });
        await run(makeState({ dealInn: '4703142743' }));
        expect(h.align).toHaveBeenCalledTimes(1);
    });

    it('обе стороны заполнены, сделка закрыта или компании нет — в сеть не ходим', async () => {
        await run(makeState({ dealInn: '4703142743', companyInn: '4703142743' }));
        await run(makeState({ closed: true }));
        await run(makeState({ company: false }));
        expect(h.align).not.toHaveBeenCalled();
    });

    it('ошибка бэка — молча, без падения', async () => {
        h.align.mockRejectedValue(new Error('сеть'));
        vi.spyOn(console, 'error').mockImplementation(() => {});
        await expect(run(makeState({}))).resolves.toEqual([]);
    });
});
