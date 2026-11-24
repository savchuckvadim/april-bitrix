import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appActions, appReducer, type InitApp } from '@/modules/app/model/AppSlice';
import type { AppStore } from '@/modules/app/model/store';
import { portalReducer, setPortal } from '../../../portal/model/PortalSlice';
import type { Portal } from '../../../portal';
import { documentProvidertAC, documentProviderReducer } from '../../../provider/model/DocumentProviderSlice';
import type { Provider } from '../../../provider';
import { rowSetReducer } from '../../../row-set/model/RowSetSlice';
import { peekInvoiceNumber, saveOfferInvoiceField, takeInvoiceNumber } from '../InvoiceNumberThunk';
import { offerDocumentActions, offerDocumentReducer } from '../OfferDocumentSlice';
import type { OfferInvoiceForm } from '../types';

const counter = vi.hoisted(() => ({ next: vi.fn(), peek: vi.fn() }));
vi.mock('../../lib/api/invoice-counter-helper', () => ({
    InvoiceCounterHelper: class {
        next = counter.next;
        peek = counter.peek;
    },
}));

const dealApi = vi.hoisted(() => ({ updateDeal: vi.fn() }));
vi.mock('../../../deal/lib/service/deal-update.service', () => dealApi);

const DEAL_ID = 7;
const RQ_ID = 5;

const provider = (id: string, rqId: string): Provider => ({ id, rqId, name: `П${id}`, domain: 'd', withTax: false }) as Provider;

/** Слепок портала с полями сделки «дата первой оплаты» и «номер счёта» (или без них). */
const portalWith = (codes: Array<[code: string, bitrixId: string]>): Portal =>
    ({
        company: { bitrixfields: [] },
        bitrixDeal: { bitrixfields: codes.map(([code, bitrixId]) => ({ code, bitrixId, items: [] })) },
    }) as unknown as Portal;

const BOTH_FIELDS: Array<[string, string]> = [
    ['first_pay_date', 'FIRST_PAY'],
    ['invoice_number', 'INV_NUMBER'],
];

interface StoreOptions {
    portal?: Portal;
    invoice?: Partial<OfferInvoiceForm>;
    providers?: Provider[];
}

/**
 * Малый стор из слайсов, которые читают thunk'и счёта. Тип полного стора нужен
 * только для dispatch thunk'ов, поэтому приведение здесь одно.
 */
const makeStore = ({ portal = portalWith(BOTH_FIELDS), invoice = {}, providers = [provider('1', String(RQ_ID))] }: StoreOptions = {}) => {
    const store = configureStore({
        reducer: {
            app: appReducer,
            offerDocument: offerDocumentReducer,
            documentProvider: documentProviderReducer,
            portal: portalReducer,
            rowSet: rowSetReducer,
        },
    });
    store.dispatch(
        appActions.setAppData({ domain: 'd', dealId: DEAL_ID, user: {}, deal: null, company: null } as unknown as InitApp),
    );
    store.dispatch(setPortal(portal));
    if (providers.length) {
        store.dispatch(documentProvidertAC.setFetched({ providers, currentId: providers[0]!.id }));
    }
    const { recipient } = store.getState().offerDocument;
    store.dispatch(offerDocumentActions.setDefaults({ recipient, invoice }));
    return store as unknown as AppStore;
};

beforeEach(() => {
    counter.next.mockReset();
    counter.peek.mockReset();
    dealApi.updateDeal.mockReset();
    dealApi.updateDeal.mockResolvedValue(undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('takeInvoiceNumber', () => {
    it('номер уже есть — next не зовётся, в сделку ничего не пишется', async () => {
        const store = makeStore({ invoice: { needGeneralInvoice: true, invoiceNumber: 'А-15' } });
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(counter.next).not.toHaveBeenCalled();
        expect(dealApi.updateDeal).not.toHaveBeenCalled();
        expect(taken).toEqual({
            error: null,
            invoice: expect.objectContaining({ needGeneralInvoice: true, invoiceNumber: 'А-15' }),
        });
    });

    it('счёт просят, номер пуст — next, номер в состоянии, запись в поле сделки invoice_number', async () => {
        counter.next.mockResolvedValue('INV-8');
        const store = makeStore({ invoice: { needGeneralInvoice: true, invoiceDate: '2026-12-01' } });
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(counter.next).toHaveBeenCalledTimes(1);
        expect(counter.next).toHaveBeenCalledWith(RQ_ID);
        expect(store.getState().offerDocument.invoice.invoiceNumber).toBe('INV-8');
        expect(dealApi.updateDeal).toHaveBeenCalledWith(DEAL_ID, 'INV_NUMBER', 'INV-8');
        expect(taken.error).toBeNull();
        expect(taken.invoice).toMatchObject({ needGeneralInvoice: true, invoiceNumber: 'INV-8', invoiceDate: '2026-12-01' });
    });

    it('«счета для всех товаров» без наборов для сравнения счётом не считается: ничего не происходит', async () => {
        const store = makeStore({ invoice: { needManyInvoices: true } });
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(counter.next).not.toHaveBeenCalled();
        expect(dealApi.updateDeal).not.toHaveBeenCalled();
        expect(taken.invoice.needManyInvoices).toBe(false);
        expect(taken.error).toBeNull();
    });

    it('счёт не просят — ничего не происходит', async () => {
        const store = makeStore();
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(counter.next).not.toHaveBeenCalled();
        expect(dealApi.updateDeal).not.toHaveBeenCalled();
        expect(store.getState().offerDocument.invoice.invoiceNumber).toBe('');
        expect(taken).toEqual({
            error: null,
            invoice: expect.objectContaining({ needGeneralInvoice: false, needManyInvoices: false, invoiceNumber: '' }),
        });
    });

    it('ошибка записи в сделку формирование не ломает: номер в запросе, на экране подсказка', async () => {
        counter.next.mockResolvedValue('INV-9');
        dealApi.updateDeal.mockRejectedValue(new Error('Bitrix недоступен'));
        const store = makeStore({ invoice: { needGeneralInvoice: true } });
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(taken.error).toBeNull();
        expect(taken.invoice.invoiceNumber).toBe('INV-9');
        expect(store.getState().offerDocument.invoiceSaveError).toEqual(expect.any(String));
    });

    it('поля invoice_number нет на портале — запись молча пропущена, подсказки нет', async () => {
        counter.next.mockResolvedValue('INV-10');
        const store = makeStore({ portal: portalWith([]), invoice: { needGeneralInvoice: true } });
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(taken.error).toBeNull();
        expect(taken.invoice.invoiceNumber).toBe('INV-10');
        expect(dealApi.updateDeal).not.toHaveBeenCalled();
        expect(store.getState().offerDocument.invoiceSaveError).toBeNull();
    });

    it('нумератор не ответил — формирование прерывается ошибкой, номер и запись в сделку не появляются', async () => {
        counter.next.mockRejectedValue(new Error('500'));
        const store = makeStore({ invoice: { needGeneralInvoice: true } });
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(taken.error).toEqual(expect.any(String));
        expect(store.getState().offerDocument.invoice.invoiceNumber).toBe('');
        expect(dealApi.updateDeal).not.toHaveBeenCalled();
    });

    it('у поставщика нет числового rqId — ошибка без запроса к нумератору', async () => {
        const store = makeStore({ providers: [provider('1', 'нет')], invoice: { needGeneralInvoice: true } });
        const taken = await store.dispatch(takeInvoiceNumber());
        expect(taken.error).toEqual(expect.any(String));
        expect(counter.next).not.toHaveBeenCalled();
    });
});

describe('saveOfferInvoiceField', () => {
    it('дата пишется в поле first_pay_date', async () => {
        const store = makeStore({ invoice: { needGeneralInvoice: true, invoiceDate: ' 2026-12-05 ' } });
        await store.dispatch(saveOfferInvoiceField('invoiceDate'));
        expect(dealApi.updateDeal).toHaveBeenCalledWith(DEAL_ID, 'FIRST_PAY', '2026-12-05');
        expect(store.getState().offerDocument.invoiceSaveError).toBeNull();
    });

    it('поля нет на портале (Field not found) — молча пропускаем', async () => {
        const store = makeStore({ portal: portalWith([]), invoice: { invoiceDate: '2026-12-05' } });
        await store.dispatch(saveOfferInvoiceField('invoiceDate'));
        expect(dealApi.updateDeal).not.toHaveBeenCalled();
        expect(store.getState().offerDocument.invoiceSaveError).toBeNull();
    });

    it('другая ошибка — подсказка, затем успешная запись её снимает', async () => {
        const store = makeStore({ invoice: { invoiceNumber: '12' } });
        dealApi.updateDeal.mockRejectedValueOnce(new Error('сеть'));
        await store.dispatch(saveOfferInvoiceField('invoiceNumber'));
        expect(store.getState().offerDocument.invoiceSaveError).toEqual(expect.any(String));
        await store.dispatch(saveOfferInvoiceField('invoiceNumber'));
        expect(store.getState().offerDocument.invoiceSaveError).toBeNull();
    });
});

describe('peekInvoiceNumber', () => {
    it('значение нумератора попадает в состояние, счётчик не растёт (next не зовётся)', async () => {
        counter.peek.mockResolvedValue('INV-41');
        const store = makeStore();
        await store.dispatch(peekInvoiceNumber({ force: true }));
        expect(store.getState().offerDocument.invoicePeek).toEqual({ status: 'ready', rqId: RQ_ID, value: 'INV-41' });
        expect(counter.next).not.toHaveBeenCalled();
    });

    it('сбой peek — статус failed, формирование не страдает', async () => {
        counter.peek.mockRejectedValue(new Error('500'));
        const store = makeStore();
        await store.dispatch(peekInvoiceNumber({ force: true }));
        expect(store.getState().offerDocument.invoicePeek).toEqual({ status: 'failed', rqId: RQ_ID, value: null });
    });

    it('тот же набор реквизитов повторно не спрашивается, force спрашивает', async () => {
        counter.peek.mockResolvedValue('INV-1');
        const store = makeStore();
        await store.dispatch(peekInvoiceNumber({ force: true }));
        await store.dispatch(peekInvoiceNumber());
        expect(counter.peek).toHaveBeenCalledTimes(1);
        await store.dispatch(peekInvoiceNumber({ force: true }));
        expect(counter.peek).toHaveBeenCalledTimes(2);
    });

    it('поставщик не загружен — ждём его без запроса, после загрузки спрашиваем', async () => {
        counter.peek.mockResolvedValue('INV-2');
        const store = makeStore({ providers: [] });
        await store.dispatch(peekInvoiceNumber({ force: true }));
        expect(counter.peek).not.toHaveBeenCalled();
        expect(store.getState().offerDocument.invoicePeek).toEqual({ status: 'loading', rqId: null, value: null });

        store.dispatch(documentProvidertAC.setFetched({ providers: [provider('1', '5')], currentId: '1' }));
        await store.dispatch(peekInvoiceNumber());
        expect(counter.peek).toHaveBeenCalledWith(RQ_ID);
        expect(store.getState().offerDocument.invoicePeek.status).toBe('ready');
    });

    it('смена поставщика: ответ прежнего поставщика отбрасывается', async () => {
        let resolveFirst: (value: string) => void = () => undefined;
        counter.peek
            .mockImplementationOnce(() => new Promise<string>(resolve => (resolveFirst = resolve)))
            .mockResolvedValueOnce('INV-B');
        const store = makeStore({ providers: [provider('1', '5'), provider('2', '6')] });
        const first = store.dispatch(peekInvoiceNumber({ force: true }));
        store.dispatch(documentProvidertAC.setCurrent('2'));
        await store.dispatch(peekInvoiceNumber());
        resolveFirst('INV-A');
        await first;
        expect(store.getState().offerDocument.invoicePeek).toEqual({ status: 'ready', rqId: 6, value: 'INV-B' });
    });
});
