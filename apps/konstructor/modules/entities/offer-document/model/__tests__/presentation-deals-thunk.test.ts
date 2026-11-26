import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appActions, appReducer, type InitApp } from '@/modules/app/model/AppSlice';
import type { AppStore } from '@/modules/app/model/store';
import type { Portal } from '../../../portal';
import { portalReducer, setPortal } from '../../../portal/model/PortalSlice';
import { ONE_PRESENTATION, TWO_PRESENTATIONS } from '../../lib/__fixtures__/presentation-state';
import type { PresentationDeal } from '../types';
import { offerDocumentActions, offerDocumentReducer } from '../OfferDocumentSlice';
import { loadPresentationDeals } from '../PresentationDealsThunk';

const api = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock('../../lib/api/presentation-deals-helper', () => ({
    PresentationDealsHelper: class {
        list = api.list;
    },
}));

const DEAL_ID = 555;

interface PortalOptions {
    withField?: boolean;
    withCategory?: boolean;
}

const portalOf = ({ withField = true, withCategory = true }: PortalOptions = {}): Portal =>
    ({
        bitrixDeal: {
            bitrixfields: withField ? [{ code: 'to_base_sales', bitrixId: 'TO_BASE_SALES', items: [] }] : [],
            categories: withCategory ? [{ code: 'sales_presentation', bitrixId: '12' }] : [],
        },
    }) as unknown as Portal;

/** Малый стор из слайсов, которые читает thunk: приложение, портал и шапка КП. */
const makeStore = (portal: Portal | null = portalOf()) => {
    const store = configureStore({
        reducer: { app: appReducer, offerDocument: offerDocumentReducer, portal: portalReducer },
    });
    store.dispatch(
        appActions.setAppData({
            domain: 'd',
            dealId: DEAL_ID,
            user: {},
            deal: { COMPANY_ID: '77' },
            company: { ID: '77' },
        } as unknown as InitApp),
    );
    if (portal) store.dispatch(setPortal(portal));
    return store as unknown as AppStore;
};

const presentationOf = (store: AppStore) => store.getState().offerDocument.presentation;

beforeEach(() => {
    api.list.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('загрузка сделок презентации', () => {
    it('ищет по воронке презентаций, ссылке на текущую сделку и компании', async () => {
        api.list.mockResolvedValue(TWO_PRESENTATIONS);
        const store = makeStore();
        await store.dispatch(loadPresentationDeals());

        expect(api.list).toHaveBeenCalledTimes(1);
        expect(api.list.mock.calls[0]![0].filter).toEqual({
            CATEGORY_ID: '12',
            COMPANY_ID: '77',
            UF_CRM_TO_BASE_SALES: [String(DEAL_ID), `D_${DEAL_ID}`],
        });
        expect(presentationOf(store)).toMatchObject({ status: 'ready', items: TWO_PRESENTATIONS, answer: false, dealId: null });
    });

    it('один раз на сделку: повторный вход запрос не повторяет', async () => {
        api.list.mockResolvedValue(ONE_PRESENTATION);
        const store = makeStore();
        await store.dispatch(loadPresentationDeals());
        await store.dispatch(loadPresentationDeals());
        expect(api.list).toHaveBeenCalledTimes(1);
    });

    it('нет поля to_base_sales на портале — презентаций нет, запроса и ошибки нет', async () => {
        const store = makeStore(portalOf({ withField: false }));
        await store.dispatch(loadPresentationDeals());
        expect(api.list).not.toHaveBeenCalled();
        expect(presentationOf(store)).toMatchObject({ status: 'ready', items: [] });
    });

    it('нет воронки sales_presentation на портале — презентаций нет, запроса и ошибки нет', async () => {
        const store = makeStore(portalOf({ withCategory: false }));
        await store.dispatch(loadPresentationDeals());
        expect(api.list).not.toHaveBeenCalled();
        expect(presentationOf(store)).toMatchObject({ status: 'ready', items: [] });
    });

    it('слепка портала ещё нет — ничего не грузим, статус остаётся «не загружено»', async () => {
        const store = makeStore(null);
        await store.dispatch(loadPresentationDeals());
        expect(api.list).not.toHaveBeenCalled();
        expect(presentationOf(store).status).toBe('idle');
    });

    it('сделки нет — ничего не грузим', async () => {
        const store = makeStore();
        store.dispatch(appActions.setAppData({ domain: 'd', dealId: null, user: {}, deal: null, company: null } as unknown as InitApp));
        await store.dispatch(loadPresentationDeals());
        expect(api.list).not.toHaveBeenCalled();
    });

    it('сбой запроса не бросает: статус «ошибка», презентаций нет, следующий вход пробует снова', async () => {
        api.list.mockRejectedValueOnce(new Error('сеть'));
        const store = makeStore();
        await expect(store.dispatch(loadPresentationDeals())).resolves.toBeUndefined();
        expect(presentationOf(store)).toMatchObject({ status: 'failed', items: [] });

        api.list.mockResolvedValueOnce(ONE_PRESENTATION);
        await store.dispatch(loadPresentationDeals());
        expect(presentationOf(store)).toMatchObject({ status: 'ready', items: ONE_PRESENTATION });
    });

    it('в плейсменте открыли другую сделку, пока шёл запрос, — чужие презентации не записываются', async () => {
        let resolve: (items: PresentationDeal[]) => void = () => undefined;
        api.list.mockReturnValue(new Promise<PresentationDeal[]>(done => (resolve = done)));
        const store = makeStore();
        const loading = store.dispatch(loadPresentationDeals());

        store.dispatch(
            appActions.setAppData({ domain: 'd', dealId: 999, user: {}, deal: null, company: null } as unknown as InitApp),
        );
        store.dispatch(offerDocumentActions.reset());
        resolve(TWO_PRESENTATIONS);
        await loading;

        expect(presentationOf(store)).toMatchObject({ status: 'idle', items: [] });
    });
});

describe('ответ о презентации в состоянии', () => {
    it('по умолчанию «Нет», выбора нет', () => {
        expect(presentationOf(makeStore())).toMatchObject({ answer: false, dealId: null });
    });

    it('сбрасывается для новой сделки вместе с остальными ответами шапки', async () => {
        api.list.mockResolvedValue(TWO_PRESENTATIONS);
        const store = makeStore();
        await store.dispatch(loadPresentationDeals());
        store.dispatch(offerDocumentActions.setPresentationAnswer(true));
        store.dispatch(offerDocumentActions.setPresentationDeal(601));

        store.dispatch(offerDocumentActions.reset());

        expect(presentationOf(store)).toEqual({ status: 'idle', items: [], answer: false, dealId: null });
    });

    it('выбранной презентации нет в обновлённом списке — выбор снимается', async () => {
        const store = makeStore();
        store.dispatch(offerDocumentActions.presentationLoaded(TWO_PRESENTATIONS));
        store.dispatch(offerDocumentActions.setPresentationDeal(601));
        store.dispatch(offerDocumentActions.presentationLoaded([{ ...ONE_PRESENTATION[0]!, id: 700 }]));
        expect(presentationOf(store).dealId).toBeNull();
    });
});
