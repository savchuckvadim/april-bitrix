import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    target: null as {
        entity: 'company' | 'deal' | 'lead';
        entityId: number;
        ufKey: string;
    } | null,
    current: null as string | null,
    mirror: null as {
        entity: 'deal';
        entityId: number;
        ufKey: string;
        value: string | null;
        poolKey: string | null;
        poolValues: unknown;
    } | null,
    companyGet: vi.fn(),
    dealGet: vi.fn(),
    leadGet: vi.fn(),
    companyUpdate: vi.fn(),
    dealUpdate: vi.fn(),
    reportFrontError: vi.fn(),
}));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({
            company: { get: h.companyGet, update: h.companyUpdate },
            deal: { get: h.dealGet, update: h.dealUpdate },
            lead: { get: h.leadGet },
        }),
    },
}));

vi.mock('../lib/inn-selectors', () => ({
    getInnTarget: () => h.target,
    getCurrentInn: () => h.current,
    getInnMirrorTarget: () => h.mirror,
}));

vi.mock('@/modules/shared/front-error', () => ({
    reportFrontError: h.reportFrontError,
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { refreshInnFromBitrix, saveInn } from './InnThunk';

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
    h.mirror = null;
    h.companyUpdate.mockReset();
    h.dealUpdate.mockReset();
    h.reportFrontError.mockReset();
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

const save = async (value: string) => {
    const types: string[] = [];
    const dispatch = ((action: { type: string }) => {
        types.push(action.type);
        return action;
    }) as unknown as AppDispatch;
    const ok = await saveInn(value)(dispatch, (() => ({})) as AppGetState);
    return { ok, types };
};

/**
 * Текущий ИНН — один в сделке и в компании (владелец, 06.10.2026): шапка,
 * записав ИНН компании, пишет его и в сделку.
 */
describe('saveInn — второй носитель', () => {
    const COMPANY = {
        entity: 'company' as const,
        entityId: 5,
        ufKey: UF,
        value: null,
        poolKey: null,
        poolValues: null,
    };

    it('ИНН компании уходит и в сделку, с пополнением её вариантов', async () => {
        h.target = COMPANY;
        h.mirror = {
            entity: 'deal',
            entityId: 27537,
            ufKey: UF,
            value: '7812032055',
            poolKey: 'UF_CRM_OP_INN_POOL',
            poolValues: ['7812032055'],
        };
        h.companyUpdate.mockResolvedValue(true);
        h.dealUpdate.mockResolvedValue(true);

        const { ok, types } = await save('7707083893');

        expect(ok).toBe(true);
        expect(h.companyUpdate).toHaveBeenCalledWith(5, { [UF]: '7707083893' });
        expect(h.dealUpdate).toHaveBeenCalledWith(27537, {
            [UF]: '7707083893',
            UF_CRM_OP_INN_POOL: ['7812032055', '7707083893'],
        });
        expect(types).toContain('inn/setSaved');
    });

    it('в сделке уже этот ИНН или сделки нет — пишем только компанию', async () => {
        h.target = COMPANY;
        h.companyUpdate.mockResolvedValue(true);
        await save('7707083893');

        h.mirror = {
            entity: 'deal',
            entityId: 27537,
            ufKey: UF,
            value: '7707083893',
            poolKey: null,
            poolValues: null,
        };
        await save('7707083893');

        expect(h.dealUpdate).not.toHaveBeenCalled();
    });

    it('сделка не приняла ИНН — сохранение компании не отменяем, сбой в отчёт', async () => {
        h.target = COMPANY;
        h.mirror = {
            entity: 'deal',
            entityId: 27537,
            ufKey: UF,
            value: null,
            poolKey: null,
            poolValues: null,
        };
        h.companyUpdate.mockResolvedValue(true);
        h.dealUpdate.mockRejectedValue(new Error('сеть'));

        const { ok, types } = await save('7707083893');

        expect(ok).toBe(true);
        expect(types).toContain('inn/setSaved');
        expect(h.reportFrontError).toHaveBeenCalled();
    });
});
