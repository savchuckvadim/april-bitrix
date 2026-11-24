import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { COMPLECT_MODE } from '../../../complect-variant/model/dto';
import { createSet, type RowSet } from '../../../row-set';
import {
    comparisonRowOf,
    compositionOf,
    syncedAlternative,
} from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { DEFAULT_INVOICE, type OfferInvoiceForm } from '../../model/types';
import { offerDocumentActions, offerDocumentReducer } from '../../model/OfferDocumentSlice';
import { recordOf, variantItems } from '../__fixtures__/variant-records';
import { oneGarantGeneral, rootStateWithVariantsAndTemplate } from '../__fixtures__/variants-state';
import { buildOfferGenerateRequest, buildOfferMultiGenerateRequest } from '../build-offer-request';
import { buildRequestInvoice, hasComparisonSets, isInvoiceRequested, visibleInvoiceAnswers } from '../invoice-request.util';
import { selectHasComparisonSets, selectInvoiceRequested, selectOfferRequestInvoice } from '../select-invoice';

const form = (patch: Partial<OfferInvoiceForm>): OfferInvoiceForm => ({ ...DEFAULT_INVOICE, ...patch });

const alternativeSet = (setId: string): RowSet =>
    syncedAlternative(setId, [comparisonRowOf(`${setId}_row`, setId, 'ur', compositionOf('ur'))]);

describe('умолчания счёта', () => {
    it('оба вопроса «Нет», вопрос о презентации тоже «Нет»', () => {
        expect(DEFAULT_INVOICE).toEqual({
            needGeneralInvoice: false,
            needManyInvoices: false,
            isByPresentationInvoices: false,
            invoiceDate: '',
            invoiceNumber: '',
        });
    });
});

describe('наборы для сравнения и видимость вопросов', () => {
    it('набор без строк не считается', () => {
        expect(hasComparisonSets([])).toBe(false);
        expect(hasComparisonSets([createSet('alt_1', 'alternative')])).toBe(false);
    });

    it('хотя бы один набор со строками — наборы есть', () => {
        expect(hasComparisonSets([createSet('alt_1', 'alternative'), alternativeSet('alt_2')])).toBe(true);
    });

    it('вопрос о счетах на все товары виден только при наборах для сравнения', () => {
        expect(visibleInvoiceAnswers(false)).toEqual(['needGeneralInvoice']);
        expect(visibleInvoiceAnswers(true)).toEqual(['needGeneralInvoice', 'needManyInvoices']);
    });
});

describe('сборка счёта для запроса', () => {
    it('без наборов для сравнения needManyInvoices уходит false, даже если ответ «да»', () => {
        const invoice = buildRequestInvoice(form({ needGeneralInvoice: true, needManyInvoices: true }), false);
        expect(invoice.needManyInvoices).toBe(false);
        expect(invoice.needGeneralInvoice).toBe(true);
    });

    it('с наборами для сравнения ответ «да» сохраняется', () => {
        const invoice = buildRequestInvoice(form({ needManyInvoices: true }), true);
        expect(invoice.needManyInvoices).toBe(true);
        expect(invoice.needGeneralInvoice).toBe(false);
    });

    it('оба «Нет» — счёта нет: оба флага false, дата и номер пустые', () => {
        const invoice = buildRequestInvoice(form({ invoiceDate: '2026-12-01', invoiceNumber: '77' }), true);
        expect(invoice).toEqual({
            needGeneralInvoice: false,
            needManyInvoices: false,
            isByPresentationInvoices: false,
            invoiceDate: '',
            invoiceNumber: '',
        });
        expect(isInvoiceRequested(invoice)).toBe(false);
    });

    it('ответ «да» на все товары без наборов и «нет» на общий — счёта тоже нет', () => {
        const invoice = buildRequestInvoice(form({ needManyInvoices: true, invoiceNumber: '5' }), false);
        expect(isInvoiceRequested(invoice)).toBe(false);
        expect(invoice.invoiceNumber).toBe('');
    });

    it('дата и номер уходят, когда просят хоть один счёт, с обрезкой пробелов', () => {
        const invoice = buildRequestInvoice(
            form({ needGeneralInvoice: true, invoiceDate: '2026-12-01', invoiceNumber: ' 17-2026 ' }),
            false,
        );
        expect(invoice.invoiceDate).toBe('2026-12-01');
        expect(invoice.invoiceNumber).toBe('17-2026');
    });

    it('вопрос о презентации в запрос всегда уходит false', () => {
        const invoice = buildRequestInvoice(form({ needGeneralInvoice: true, isByPresentationInvoices: true }), false);
        expect(invoice.isByPresentationInvoices).toBe(false);
    });
});

/** Состояние КП в Word с открытым вариантом; наборы для сравнения и ответы о счёте задаются снаружи. */
const stateOf = (invoice: Partial<OfferInvoiceForm>, withSets: boolean): RootState => {
    const base = rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems, oneGarantGeneral(), {
        mode: COMPLECT_MODE.compare,
        openVariantSmartId: 102,
    });
    let offerDocument = base.offerDocument;
    offerDocument = offerDocumentReducer(offerDocument, offerDocumentActions.setDefaults({ recipient: offerDocument.recipient, invoice }));
    return {
        ...base,
        offerDocument,
        rowSet: { ...base.rowSet, alternative: withSets ? [alternativeSet('alt_1')] : [] },
    };
};

describe('счёт в запросе КП в Word', () => {
    it('по умолчанию счёта нет: оба вопроса false', () => {
        const request = buildOfferGenerateRequest(stateOf({}, false));
        expect(request?.invoice).toMatchObject({ needGeneralInvoice: false, needManyInvoices: false });
    });

    it('«все товары» без наборов для сравнения уходит false', () => {
        const state = stateOf({ needGeneralInvoice: true, needManyInvoices: true }, false);
        expect(selectHasComparisonSets(state)).toBe(false);
        expect(buildOfferGenerateRequest(state)?.invoice).toMatchObject({
            needGeneralInvoice: true,
            needManyInvoices: false,
        });
        expect(buildOfferMultiGenerateRequest(state)?.invoice.needManyInvoices).toBe(false);
    });

    it('с наборами для сравнения ответ «все товары» доходит до запроса', () => {
        const state = stateOf({ needManyInvoices: true, invoiceDate: '2026-12-01', invoiceNumber: '9' }, true);
        expect(selectHasComparisonSets(state)).toBe(true);
        expect(selectInvoiceRequested(state)).toBe(true);
        expect(buildOfferMultiGenerateRequest(state)?.invoice).toEqual({
            needGeneralInvoice: false,
            needManyInvoices: true,
            isByPresentationInvoices: false,
            invoiceDate: '2026-12-01',
            invoiceNumber: '9',
        });
    });

    it('выбор счёта читает тот же счёт, что уходит в запрос', () => {
        const state = stateOf({ needGeneralInvoice: true, invoiceNumber: ' 4 ' }, false);
        expect(selectOfferRequestInvoice(state)).toEqual(buildOfferGenerateRequest(state)?.invoice);
    });
});
