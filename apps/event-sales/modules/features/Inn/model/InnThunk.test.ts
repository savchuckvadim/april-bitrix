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
    setInnOnServer: vi.fn(),
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

vi.mock('../lib/api/inn-set-helper', () => ({
    setInnOnServer: h.setInnOnServer,
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
    h.companyGet.mockReset();
    h.dealGet.mockReset();
    h.leadGet.mockReset();
    h.setInnOnServer.mockReset();
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

/** Стор фрейма: открыта сделка 27537 компании 5, сотрудник 447. */
const STATE = {
    app: {
        domain: 'garant.bitrix24.ru',
        bitrix: {
            deal: { ID: '27537' },
            company: { ID: '5' },
            lead: null,
            user: { ID: '447' },
        },
    },
};

const save = async (value: string) => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const dispatch = ((action: { type: string; payload?: unknown }) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;
    const ok = await saveInn(value)(
        dispatch,
        (() => STATE) as unknown as AppGetState,
    );
    return { ok, actions, types: actions.map(action => action.type) };
};

/**
 * Шапка пишет ИНН через бэк (26.10.2026): раньше — прямо из браузера в
 * компанию и сделку, мимо правил «Выбрать» и без записи в ленте.
 */
describe('saveInn — через бэк', () => {
    it('в бэк уходят открытые сущности и автор, состояние — после ответа', async () => {
        h.setInnOnServer.mockResolvedValue({
            inn: '7707083893',
            entity: 'deal',
            warnings: [],
        });

        const { ok, types } = await save(' 7707083893 ');

        expect(ok).toBe(true);
        expect(h.setInnOnServer).toHaveBeenCalledWith({
            domain: 'garant.bitrix24.ru',
            inn: '7707083893',
            dealId: 27537,
            companyId: 5,
            leadId: undefined,
            userId: 447,
        });
        expect(types).toEqual(['inn/setSaving', 'inn/setSaved']);
    });

    it('отказ бэка — его причина в шапке, ИНН не меняется', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        h.setInnOnServer.mockRejectedValue({
            response: {
                data: {
                    message:
                        'Сделка 27537 закрыта: ИНН договора можно только посмотреть.',
                },
            },
        });

        const { ok, actions } = await save('7707083893');

        expect(ok).toBe(false);
        expect(actions.at(-1)).toEqual({
            type: 'inn/setError',
            payload: {
                message:
                    'Сделка 27537 закрыта: ИНН договора можно только посмотреть.',
            },
        });
    });

    it('сеть упала — общая фраза вместо кода ответа', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        h.setInnOnServer.mockRejectedValue(new Error('Network Error'));

        const { actions } = await save('7707083893');

        expect(actions.at(-1)).toEqual({
            type: 'inn/setError',
            payload: { message: 'Не удалось сохранить ИНН — попробуйте ещё раз.' },
        });
    });

    it('не ИНН — в бэк не ходим', async () => {
        const { ok } = await save('12345');
        expect(ok).toBe(false);
        expect(h.setInnOnServer).not.toHaveBeenCalled();
    });
});
