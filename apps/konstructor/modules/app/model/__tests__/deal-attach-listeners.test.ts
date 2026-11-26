import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IBXDeal } from '@bitrix/index';
import { snapshotActions } from '@/modules/entities/snapshot';
import { appActions } from '../AppSlice';
import { setupStore } from '../store';

/**
 * Слушатели настоящего стора на сделку, созданную из компании: приложение
 * получает сделку (setDeal) и перезапускает то, что зависит от сделки, а слепок,
 * записанный отправкой, принимается за слепок сделки.
 */
const mocks = vi.hoisted(() => ({
    loadPortalSnapshot: vi.fn(),
    fetchComplectVariants: vi.fn(),
}));

vi.mock('@/modules/entities/portal/lib/portal-snapshot.util', () => ({
    loadPortalSnapshot: mocks.loadPortalSnapshot,
}));
vi.mock('@/modules/entities/complect-variant', async importOriginal => ({
    ...(await importOriginal<typeof import('@/modules/entities/complect-variant')>()),
    fetchComplectVariants: mocks.fetchComplectVariants,
}));

const DEAL = { ID: '700', TITLE: 'ООО Ромашка', CATEGORY_ID: '34' } as unknown as IBXDeal;

/** Портал со смартом «Варианты комплекта» и воронкой sales_base */
const PORTAL = {
    bitrixDeal: {
        bitrixfields: [],
        categories: [{ code: 'sales_base', bitrixId: '34', stages: [] }],
    },
    smarts: [{ type: 'complect_variant', entityTypeId: 1234 }],
    rpas: [],
    company: null,
};

const settle = async () => {
    for (let step = 0; step < 5; step += 1) await new Promise(resolve => setTimeout(resolve, 0));
};

describe('сделка создана из компании (setDeal)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.loadPortalSnapshot.mockResolvedValue({ value: PORTAL });
        mocks.fetchComplectVariants.mockReturnValue(() => Promise.resolve());
    });

    it('сделка и её ID попадают в приложение', () => {
        const store = setupStore();

        store.dispatch(appActions.setDeal(DEAL));

        const { app } = store.getState();
        expect(app.dealId).toBe(700);
        expect(app.bitrix.deal).toEqual(DEAL);
    });

    it('портал перезапускается со сделкой, варианты комплекта грузятся для новой сделки', async () => {
        const store = setupStore();

        store.dispatch(appActions.setDeal(DEAL));
        await settle();

        expect(mocks.loadPortalSnapshot).toHaveBeenCalledTimes(1);
        expect(store.getState().portal.status).toBe('succeeded');
        expect(mocks.fetchComplectVariants).toHaveBeenCalledTimes(1);
    });

    it('отдел остаётся продажным: сделка воронки sales_base сервисной не делает', async () => {
        const store = setupStore();

        store.dispatch(appActions.setDeal(DEAL));
        await settle();

        expect(store.getState().app.department).toBe('sales');
    });
});

describe('слепок, записанный отправкой сделки', () => {
    it('сделка есть, восстановление не запускалось: сборка принята за слепок сделки', () => {
        const store = setupStore();
        store.dispatch(appActions.setDealId(700));

        store.dispatch(snapshotActions.saveDone());

        expect(store.getState().snapshot.status).toBe('restored');
    });

    it('сделки нет: статус слепка не меняется', () => {
        const store = setupStore();

        store.dispatch(snapshotActions.saveDone());

        expect(store.getState().snapshot.status).toBe('idle');
    });

    it('слепок сделки уже восстанавливается: статус не трогаем', () => {
        const store = setupStore();
        store.dispatch(appActions.setDealId(700));
        store.dispatch(snapshotActions.started());

        store.dispatch(snapshotActions.saveDone());

        expect(store.getState().snapshot.status).toBe('loading');
    });
});
