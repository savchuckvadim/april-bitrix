import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Portal, PortalParts } from '../../model/dto';

const mocks = vi.hoisted(() => ({
    fetchParts: vi.fn(),
    fetch: vi.fn(),
}));

vi.mock('../api/portal-helper', () => ({
    PortalHelper: class {
        fetchParts = mocks.fetchParts;
        fetch = mocks.fetch;
    },
}));
// кэш в браузере тут не проверяется: загрузчик зовётся напрямую
vi.mock('@workspace/api', () => ({
    SWR_DAY_MS: 86_400_000,
    resolveSwrCache: async ({ fetcher }: { fetcher: () => Promise<Portal> }) => ({
        value: await fetcher(),
    }),
}));

import { portalReducer } from '../../model/PortalSlice';
import { initPortal } from '../../model/PortalThunk';
import { KONSTRUCTOR_PORTAL_QUERY, portalFromParts } from '../portal-parts.util';
import {
    getComplectVariantPbxSmartEntityId,
    getIsServiceDepartment,
    getRpaSupplyTypeId,
    getServiceOfferPbxSmartEntityId,
} from '../portal-util';

/** Ответ узкой ручки: только то, что запрашивает конструктор */
const parts = {
    id: 7,
    bitrixDeal: {
        bitrixfields: [{ code: 'document_provider', bitrixId: 'UF_CRM_1' }],
        categories: [{ code: 'service_base', bitrixId: '34' }],
    },
    company: { bitrixfields: [{ code: 'op_client_type', bitrixId: 'UF_CRM_2' }] },
    rpas: [{ code: 'supply', bitrixId: '12', bitrixfields: [] }],
    smarts: [
        { type: 'complect_variant', entityTypeId: 1040, bitrixfields: [] },
        { type: 'service_offer', entityTypeId: 1050, bitrixfields: [] },
    ],
} as unknown as PortalParts;

describe('портал конструктора из частей', () => {
    it('запрашиваются только нужные части; смарты — двух типов и без полей', () => {
        expect(KONSTRUCTOR_PORTAL_QUERY).toEqual({
            parts: ['bitrixDeal', 'company', 'rpas', 'smarts'],
            smartTypes: ['service_offer', 'complect_variant'],
            withoutFields: ['smarts'],
        });
    });

    it('собирается в объект прежней формы — читатели портала не меняются', () => {
        const portal = portalFromParts(parts);

        expect(portal.id).toBe(7);
        expect(getComplectVariantPbxSmartEntityId(portal)).toBe(1040);
        expect(getServiceOfferPbxSmartEntityId(portal)).toBe(1050);
        expect(getRpaSupplyTypeId(portal)).toBe(12);
        expect(getIsServiceDepartment(portal, { CATEGORY_ID: '34' } as never)).toBe(true);
        expect(portal.company?.bitrixfields).toHaveLength(1);
        // как в полной модели: deals — список, bitrixDeal — его первый элемент
        expect(portal.deals).toEqual([portal.bitrixDeal]);
    });

    it('незапрошенные части приходят пустыми', () => {
        const portal = portalFromParts({ id: 1 });
        expect(portal).toMatchObject({
            bitrixDeal: null,
            deals: [],
            company: null,
            rpas: [],
            smarts: [],
            bitrixLists: [],
            contact: null,
            lead: null,
        });
        expect(getComplectVariantPbxSmartEntityId(portal)).toBeNull();
    });
});

describe('initPortal: узкая ручка с запасным путём', () => {
    const createStore = () => configureStore({ reducer: { portal: portalReducer } });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    it('портал берётся узкой ручкой, полная не трогается', async () => {
        mocks.fetchParts.mockResolvedValue(parts);
        const store = createStore();

        await store.dispatch(initPortal({ domain: 'portal.ru', deal: null }) as never);

        expect(mocks.fetchParts).toHaveBeenCalledWith('portal.ru', KONSTRUCTOR_PORTAL_QUERY);
        expect(mocks.fetch).not.toHaveBeenCalled();
        expect(store.getState().portal.status).toBe('succeeded');
        expect(store.getState().portal.current?.id).toBe(7);
    });

    it('узкая ручка недоступна (бэк не выложен) — берётся полная модель, вход не ломается', async () => {
        mocks.fetchParts.mockRejectedValue(new Error('404'));
        mocks.fetch.mockResolvedValue({ ...portalFromParts(parts), id: 9 });
        const store = createStore();

        await store.dispatch(initPortal({ domain: 'portal.ru', deal: null }) as never);

        expect(mocks.fetch).toHaveBeenCalledWith('portal.ru');
        expect(store.getState().portal.status).toBe('succeeded');
        expect(store.getState().portal.current?.id).toBe(9);
    });

    it('недоступны обе — честная ошибка портала', async () => {
        mocks.fetchParts.mockRejectedValue(new Error('404'));
        mocks.fetch.mockRejectedValue(new Error('сеть'));
        const store = createStore();

        await store.dispatch(initPortal({ domain: 'portal.ru', deal: null }) as never);

        expect(store.getState().portal.status).toBe('failed');
    });
});
