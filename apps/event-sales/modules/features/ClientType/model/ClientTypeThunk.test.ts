import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    view: {
        available: true,
        current: null as string | null,
        deal: null as string | null,
        company: null as string | null,
        conflict: false,
        options: [],
    },
    alignClientType: vi.fn(),
    setClientType: vi.fn(),
}));

vi.mock('../lib/client-type-selectors', () => ({
    selectClientTypeView: () => h.view,
}));
vi.mock('../lib/api/client-type-helper', () => ({
    alignClientType: h.alignClientType,
    setClientType: h.setClientType,
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { alignClientTypeOnOpen, saveClientType } from './ClientTypeThunk';

const state = (deal: Record<string, unknown> | null = { ID: '100' }) => ({
    app: {
        domain: 'garant.bitrix24.ru',
        bitrix: { deal, company: { ID: '55' } },
    },
});

const run = async (
    thunk: (d: AppDispatch, g: AppGetState) => Promise<unknown>,
    st = state(),
) => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const dispatch = ((action: { type: string; payload?: unknown }) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;
    await thunk(dispatch, (() => st) as unknown as AppGetState);
    return actions;
};

beforeEach(() => {
    h.view = {
        available: true,
        current: null,
        deal: null,
        company: null,
        conflict: false,
        options: [],
    };
    h.alignClientType.mockReset();
    h.setClientType.mockReset();
});

describe('alignClientTypeOnOpen', () => {
    it('одна сторона пуста — бэк выравнивает, ответ в шапку', async () => {
        h.view.company = 'ip';
        h.alignClientType.mockResolvedValue({
            deal: 'ip',
            company: 'ip',
            skipped: false,
        });

        const actions = await run(alignClientTypeOnOpen());

        expect(h.alignClientType).toHaveBeenCalledWith(
            100,
            'garant.bitrix24.ru',
        );
        expect(actions).toEqual([
            {
                type: 'clientType/setSaved',
                payload: { deal: 'ip', company: 'ip' },
            },
        ]);
    });

    it('бэк недавно выравнивал (skipped) — шапку не трогаем', async () => {
        h.view.company = 'ip';
        h.alignClientType.mockResolvedValue({
            deal: null,
            company: null,
            skipped: true,
        });

        expect(await run(alignClientTypeOnOpen())).toEqual([]);
    });

    it('обе пусты, обе заполнены или закрытая сделка — в сеть не ходим', async () => {
        await run(alignClientTypeOnOpen());

        h.view.deal = 'ip';
        h.view.company = 'state';
        await run(alignClientTypeOnOpen());

        h.view.company = null;
        await run(alignClientTypeOnOpen(), state({ ID: '100', CLOSED: 'Y' }));

        expect(h.alignClientType).not.toHaveBeenCalled();
    });
});

describe('saveClientType', () => {
    it('выбор уходит в бэк со сделкой и компанией', async () => {
        h.setClientType.mockResolvedValue({ deal: 'fiz', company: 'fiz' });

        const actions = await run(saveClientType('fiz'));

        expect(h.setClientType).toHaveBeenCalledWith({
            domain: 'garant.bitrix24.ru',
            code: 'fiz',
            dealId: 100,
            companyId: 55,
        });
        expect(actions.map(action => action.type)).toEqual([
            'clientType/setSaving',
            'clientType/setSaved',
        ]);
    });

    it('отказ бэка — его причина под чипом', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        h.setClientType.mockRejectedValue({
            response: { data: { message: 'Тип клиента не записан: …' } },
        });

        const actions = await run(saveClientType('fiz'));

        expect(actions.at(-1)).toEqual({
            type: 'clientType/setError',
            payload: { message: 'Тип клиента не записан: …' },
        });
    });
});
