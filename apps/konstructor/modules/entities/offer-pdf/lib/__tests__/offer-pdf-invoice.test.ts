import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { withClientType, type ClientTypeItemCode } from '../../../document-payload/lib/__fixtures__/root-state';
import { CLIENT_TYPE_REQUIRED_BLOCKER } from '../../../offer-document/lib/client-type.util';
import { recordOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';
import { selectOfferRequestInvoice } from '../../../offer-document/lib/select-invoice';
import { offerDocumentActions, offerDocumentReducer } from '../../../offer-document/model/OfferDocumentSlice';
import type { OfferInvoiceForm } from '../../../offer-document/model/types';
import { OFFER_PDF_DEFAULT_SETTINGS, OFFER_PDF_OMITTED_WORD_FIELDS } from '../../model/types';
import {
    buildOfferPdfGenerateRequest,
    offerPdfGenerateBlocker,
    offerPdfRequestBlocker,
    withOfferPdfInvoice,
    type OfferPdfRequestOptions,
} from '../build-offer-pdf-request';
import { offerPdfRequestKey } from '../offer-pdf-request-key';

const options: OfferPdfRequestOptions = {
    templateCode: 'classic',
    palette: null,
    settings: OFFER_PDF_DEFAULT_SETTINGS,
    letter: { appeal: '', text: '' },
    documentNumber: '',
};

/** Состояние КП в PDF: клиент, ответы о счёте и открытый вариант задаются снаружи. */
const stateOf = (clientType: ClientTypeItemCode | null, invoice: Partial<OfferInvoiceForm> = {}): RootState => {
    const base = withClientType(rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems), clientType);
    return {
        ...base,
        offerDocument: offerDocumentReducer(
            base.offerDocument,
            offerDocumentActions.setDefaults({ recipient: base.offerDocument.recipient, invoice }),
        ),
    };
};

const INVOICE_FIELDS = ['invoice', 'invoiceTemplateId'];

describe('счёт в PDF-КП: превью и ключ превью', () => {
    it('в списке вырезаемых полей остаются invoice и invoiceTemplateId', () => {
        for (const field of INVOICE_FIELDS) expect(OFFER_PDF_OMITTED_WORD_FIELDS).toContain(field);
    });

    it('в запросе превью счёта нет, как бы ни были заполнены ответы', () => {
        const state = stateOf('commerc', { needGeneralInvoice: true, invoiceNumber: '15', invoiceDate: '2026-12-01' });
        const request = buildOfferPdfGenerateRequest(state, options);
        expect(request).not.toBeNull();
        for (const field of INVOICE_FIELDS) expect(request).not.toHaveProperty(field);
    });

    it('правка счёта ключ превью не меняет: превью не пересобирается', () => {
        const before = buildOfferPdfGenerateRequest(stateOf('commerc'), options);
        const after = buildOfferPdfGenerateRequest(
            stateOf('commerc', { needGeneralInvoice: true, needManyInvoices: true, invoiceNumber: '15', invoiceDate: '2026-12-01' }),
            options,
        );
        expect(offerPdfRequestKey(after!)).toBe(offerPdfRequestKey(before!));
        expect(offerPdfRequestKey(after!)).not.toContain('invoice');
    });
});

describe('счёт в PDF-КП: запрос формирования', () => {
    it('счёт и пустой invoiceTemplateId добавляются к запросу превью', () => {
        const state = stateOf('commerc', { needGeneralInvoice: true, invoiceNumber: '15', invoiceDate: '2026-12-01' });
        const preview = buildOfferPdfGenerateRequest(state, options)!;
        const generate = withOfferPdfInvoice(preview, selectOfferRequestInvoice(state));
        expect(generate.invoice).toEqual({
            needGeneralInvoice: true,
            needManyInvoices: false,
            isByPresentationInvoices: false,
            invoiceDate: '2026-12-01',
            invoiceNumber: '15',
        });
        expect(generate.invoiceTemplateId).toBe('');
        // остальное в запросе то же, что у превью
        expect({ ...generate, invoice: undefined, invoiceTemplateId: undefined }).toEqual({
            ...preview,
            invoice: undefined,
            invoiceTemplateId: undefined,
        });
    });

    it('оба «Нет» — в запросе формирования пустой счёт, бэк его не делает', () => {
        const state = stateOf('commerc');
        const generate = withOfferPdfInvoice(buildOfferPdfGenerateRequest(state, options)!, selectOfferRequestInvoice(state));
        expect(generate.invoice).toEqual({
            needGeneralInvoice: false,
            needManyInvoices: false,
            isByPresentationInvoices: false,
            invoiceDate: '',
            invoiceNumber: '',
        });
    });

    it('без наборов для сравнения needManyInvoices в запросе формирования false', () => {
        const state = stateOf('commerc', { needGeneralInvoice: true, needManyInvoices: true });
        const generate = withOfferPdfInvoice(buildOfferPdfGenerateRequest(state, options)!, selectOfferRequestInvoice(state));
        expect(generate.invoice?.needManyInvoices).toBe(false);
    });
});

describe('тип клиента в PDF-КП', () => {
    it.each<[ClientTypeItemCode, string]>([
        ['commerc', 'org'],
        ['state', 'org_state'],
        ['ip', 'ip'],
        ['fiz', 'fiz'],
        ['layer', 'fiz'],
    ])('пункт «%s» → clientType «%s» в запросе', (code, expected) => {
        expect(buildOfferPdfGenerateRequest(stateOf(code), options)?.clientType).toBe(expected);
    });

    it('тип не задан — формирование заблокировано, превью собирается', () => {
        const state = stateOf(null);
        expect(offerPdfGenerateBlocker(state)).toBe(CLIENT_TYPE_REQUIRED_BLOCKER);
        expect(offerPdfRequestBlocker(state)).toBeNull();
        expect(buildOfferPdfGenerateRequest(state, options)).not.toBeNull();
    });

    it('тип задан — формирование не заблокировано', () => {
        expect(offerPdfGenerateBlocker(stateOf('ip'))).toBeNull();
    });
});
