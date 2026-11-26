import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    loadPortalSnapshot: vi.fn(),
    getSalesFunnelScope: vi.fn(),
    listOpenCompanyDeals: vi.fn(),
}));

vi.mock('@/modules/entities/portal', () => ({
    loadPortalSnapshot: mocks.loadPortalSnapshot,
    getSalesFunnelScope: mocks.getSalesFunnelScope,
}));
vi.mock('../../../services/bx-company-entry.service', () => ({
    listOpenCompanyDeals: mocks.listOpenCompanyDeals,
}));

import { resolveCompanyDealId } from '../company-entry.util';

const FUNNEL = { categoryId: 34, finalStageIds: new Set(['C34:WON']) };
const PORTAL = { bitrixDeal: {} };
const SESSION = Promise.resolve();

const openDeal = (ID: string | number, created: string) => ({
    ID,
    CATEGORY_ID: '34',
    STAGE_ID: 'C34:NEW',
    CLOSED: 'N',
    DATE_CREATE: created,
});

describe('сделка компании при входе из её карточки', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.loadPortalSnapshot.mockResolvedValue({ value: PORTAL });
        mocks.getSalesFunnelScope.mockReturnValue(FUNNEL);
        mocks.listOpenCompanyDeals.mockResolvedValue([]);
    });

    it('воронка берётся из слепка портала и уходит в запрос сделок компании', async () => {
        mocks.listOpenCompanyDeals.mockResolvedValue([
            openDeal('501', '2026-05-01T10:00:00+03:00'),
        ]);

        const dealId = await resolveCompanyDealId(77, 'portal.bitrix24.ru', SESSION);

        expect(mocks.loadPortalSnapshot).toHaveBeenCalledWith('portal.bitrix24.ru');
        expect(mocks.getSalesFunnelScope).toHaveBeenCalledWith(PORTAL);
        expect(mocks.listOpenCompanyDeals).toHaveBeenCalledWith(77, 34);
        expect(dealId).toBe(501);
    });

    it('из нескольких открытых сделок берёт самую свежую', async () => {
        mocks.listOpenCompanyDeals.mockResolvedValue([
            openDeal(1, '2026-01-01T10:00:00+03:00'),
            openDeal(2, '2026-06-01T10:00:00+03:00'),
            openDeal(3, '2026-03-01T10:00:00+03:00'),
        ]);

        expect(await resolveCompanyDealId(77, 'p.bitrix24.ru', SESSION)).toBe(2);
    });

    it('подходящей сделки нет — null: работаем на компании без сделки', async () => {
        mocks.listOpenCompanyDeals.mockResolvedValue([
            { ...openDeal(9, '2026-05-01T10:00:00+03:00'), STAGE_ID: 'C34:WON' },
        ]);

        expect(await resolveCompanyDealId(77, 'p.bitrix24.ru', SESSION)).toBeNull();
    });

    it('слепок портала ждёт токен сессии портала', async () => {
        let resolveSession!: () => void;
        const session = new Promise<void>(done => {
            resolveSession = done;
        });

        const running = resolveCompanyDealId(77, 'p.bitrix24.ru', session);
        await Promise.resolve();
        expect(mocks.loadPortalSnapshot).not.toHaveBeenCalled();

        resolveSession();
        await running;
        expect(mocks.loadPortalSnapshot).toHaveBeenCalledTimes(1);
    });

    it('воронки sales_base на портале нет — сделки Битрикса не запрашиваются', async () => {
        mocks.getSalesFunnelScope.mockReturnValue(null);

        expect(await resolveCompanyDealId(77, 'p.bitrix24.ru', SESSION)).toBeNull();
        expect(mocks.listOpenCompanyDeals).not.toHaveBeenCalled();
    });

    it('слепок портала не загрузился — null, вход не падает', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        mocks.loadPortalSnapshot.mockRejectedValue(new Error('сеть'));

        expect(await resolveCompanyDealId(77, 'p.bitrix24.ru', SESSION)).toBeNull();
        expect(mocks.listOpenCompanyDeals).not.toHaveBeenCalled();
        warn.mockRestore();
    });
});
