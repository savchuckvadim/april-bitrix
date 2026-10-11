import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ dealUpdate: vi.fn() }));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({
            deal: { update: h.dealUpdate },
            company: { update: vi.fn() },
            lead: { update: vi.fn() },
        }),
    },
}));

vi.mock('../lib/purchase-signals', async importOriginal => ({
    ...(await importOriginal<typeof import('../lib/purchase-signals')>()),
    toConcurentFieldValue: () => ({ key: 'UF_CRM_CONCURENTS', value: ['7'] }),
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { saveConcurents } from './PurchaseSignalsThunk';

const run = async (isConcurentsSaving: boolean) => {
    const types: string[] = [];
    const state = {
        portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
        app: { bitrix: { deal: { ID: '27537' }, company: null, lead: null } },
        purchaseSignals: { isConcurentsSaving },
    };
    const dispatch = ((action: { type: string }) => {
        types.push(action.type);
        return action;
    }) as unknown as AppDispatch;
    await saveConcurents(['garant'])(
        dispatch,
        (() => state) as unknown as AppGetState,
    );
    return types;
};

beforeEach(() => {
    h.dealUpdate.mockReset();
    h.dealUpdate.mockResolvedValue(true);
});

/**
 * «Конкуренты» (владелец, 06.10.2026): пока выбор пишется, видно
 * «Сохраняем…», а повторное нажатие не запускает вторую запись.
 */
describe('saveConcurents', () => {
    it('запись идёт под флагом «Сохраняем…», новый выбор — до его снятия', async () => {
        expect(await run(false)).toEqual([
            'purchaseSignals/setError',
            'purchaseSignals/setConcurentsSaving',
            'purchaseSignals/setConcurents',
            'purchaseSignals/setConcurentsSaving',
        ]);
        expect(h.dealUpdate).toHaveBeenCalledTimes(1);
    });

    it('пока прошлая запись не закончилась — повторное нажатие ничего не делает', async () => {
        expect(await run(true)).toEqual([]);
        expect(h.dealUpdate).not.toHaveBeenCalled();
    });

    it('запись упала — флаг всё равно снимается, менеджер видит ошибку', async () => {
        h.dealUpdate.mockRejectedValue(new Error('сеть'));
        const types = await run(false);

        expect(types.at(-1)).toBe('purchaseSignals/setConcurentsSaving');
        expect(types).toContain('purchaseSignals/setError');
        expect(types).not.toContain('purchaseSignals/setConcurents');
    });
});
