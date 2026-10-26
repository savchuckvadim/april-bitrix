import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ alignDealOwner: vi.fn() }));

vi.mock('../lib/api/deal-owner-helper', () => ({
    alignDealOwner: h.alignDealOwner,
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { alignDealOwnerOnOpen } from './deal-owner-align.thunk';

const run = (deal: Record<string, unknown> | null, userId = '447') =>
    alignDealOwnerOnOpen()(
        (() => undefined) as unknown as AppDispatch,
        (() => ({
            app: {
                domain: 'garant.bitrix24.ru',
                bitrix: { deal, user: { ID: userId } },
            },
        })) as unknown as AppGetState,
    );

beforeEach(() => {
    h.alignDealOwner.mockReset();
    h.alignDealOwner.mockResolvedValue({});
});

/** Компания и контакты — за ответственным своей сделки (22.10.2026). */
describe('alignDealOwnerOnOpen', () => {
    it('своя открытая сделка — бэк выравнивает компанию и контакты', async () => {
        await run({ ID: '100', ASSIGNED_BY_ID: '447' });
        expect(h.alignDealOwner).toHaveBeenCalledWith(
            100,
            'garant.bitrix24.ru',
            447,
        );
    });

    it('чужая, закрытая или без сделки — в сеть не ходим', async () => {
        await run({ ID: '100', ASSIGNED_BY_ID: '331' });
        await run({ ID: '100', ASSIGNED_BY_ID: '447', CLOSED: 'Y' });
        await run(null);
        expect(h.alignDealOwner).not.toHaveBeenCalled();
    });

    it('бэк не ответил — открытие не падает', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        h.alignDealOwner.mockRejectedValue(new Error('сеть'));
        await expect(run({ ID: '100', ASSIGNED_BY_ID: '447' })).resolves.toBeUndefined();
    });
});
