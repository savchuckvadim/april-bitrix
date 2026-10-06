import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    target: null as {
        entity: 'company' | 'deal' | 'lead';
        entityId: number;
        ufKey: string;
    } | null,
    current: null as string | null,
    companyGet: vi.fn(),
    dealGet: vi.fn(),
    leadGet: vi.fn(),
}));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({
            company: { get: h.companyGet },
            deal: { get: h.dealGet },
            lead: { get: h.leadGet },
        }),
    },
}));

vi.mock('../lib/inn-selectors', () => ({
    getInnTarget: () => h.target,
    getCurrentInn: () => h.current,
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { refreshInnFromBitrix } from './InnThunk';

const UF = 'UF_CRM_OP_INN';

const run = async () => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const dispatch = ((action: { type: string; payload?: unknown }) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;
    await refreshInnFromBitrix()(dispatch, (() => ({})) as AppGetState);
    return actions;
};

beforeEach(() => {
    h.target = { entity: 'deal', entityId: 27537, ufKey: UF };
    h.current = null;
    h.companyGet.mockReset();
    h.dealGet.mockReset();
    h.leadGet.mockReset();
});

/**
 * «Выбрать» во вкладке «ИНН» пишет мимо шапки — шапка перечитывает ИНН
 * своей сущности (владелец, 06.10.2026: до перезагрузки был старый).
 */
describe('refreshInnFromBitrix', () => {
    it('шапка показывает ИНН сделки — новое значение доезжает без поиска дублей', async () => {
        h.dealGet.mockResolvedValue({ [UF]: ' 3664069397 ' });

        expect(await run()).toEqual([
            { type: 'inn/syncValue', payload: { value: '3664069397' } },
        ]);
        expect(h.dealGet).toHaveBeenCalledWith(27537);
    });

    it('шапка показывает ИНН компании — читается компания', async () => {
        h.target = { entity: 'company', entityId: 5, ufKey: UF };
        h.companyGet.mockResolvedValue({ [UF]: '3664069397' });

        expect(await run()).toHaveLength(1);
        expect(h.companyGet).toHaveBeenCalledWith(5);
        expect(h.dealGet).not.toHaveBeenCalled();
    });

    it('у лида запись лежит в result', async () => {
        h.target = { entity: 'lead', entityId: 9, ufKey: UF };
        h.leadGet.mockResolvedValue({ result: { [UF]: '3664069397' } });

        expect(await run()).toEqual([
            { type: 'inn/syncValue', payload: { value: '3664069397' } },
        ]);
    });

    it('значение не изменилось или поле пустое — шапку не трогаем', async () => {
        h.current = '3664069397';
        h.dealGet.mockResolvedValue({ [UF]: '3664069397' });
        expect(await run()).toEqual([]);

        h.current = null;
        h.dealGet.mockResolvedValue({ [UF]: '' });
        expect(await run()).toEqual([]);
    });

    it('Битрикс не ответил — без падения, шапка как была', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        h.dealGet.mockRejectedValue(new Error('сеть'));

        expect(await run()).toEqual([]);
        expect(error).toHaveBeenCalled();
    });
});
