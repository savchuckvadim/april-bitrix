import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { COMPLECT_MODE, type ComplectMode } from '../../../complect-variant/model/dto';
import { resolveSupply } from '../../../catalog';
import {
    recordOf,
    snapshotRowsOf,
    variantCatalog,
    variantItems,
} from '../../../offer-document/lib/__fixtures__/variant-records';
import {
    oneGarantGeneral,
    rootStateWithVariants,
    twoGarantGeneral,
} from '../../../offer-document/lib/__fixtures__/variants-state';
import {
    OFFER_COMPLECTS_MODE,
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    type OfferComplectsMode,
    type OfferPdfSnapshot,
} from '../../model/types';
import { buildOfferPdfGenerateRequest, type OfferPdfRequestOptions } from '../build-offer-pdf-request';
import { offerPdfRequestKey } from '../offer-pdf-request-key';

/**
 * Наполнение по комплектам в запросе PDF-КП: разделы комплектов и способ
 * печати на верхнем уровне и у открытого варианта.
 */

const optionsOf = (complectsMode: OfferComplectsMode = OFFER_COMPLECTS_MODE.MERGED): OfferPdfRequestOptions => ({
    templateCode: 'classic',
    palette: null,
    settings: { ...OFFER_PDF_DEFAULT_SETTINGS, complectsMode },
    letter: { appeal: '', text: '' },
    documentNumber: '',
});

const pdfOf = (complectsMode: OfferComplectsMode): OfferPdfSnapshot => ({
    format: OFFER_DOCUMENT_FORMAT.PDF,
    templateCode: 'classic',
    palette: null,
    settings: { ...OFFER_PDF_DEFAULT_SETTINGS, complectsMode },
});

const requestOf = (state: RootState, options = optionsOf()) => {
    const request = buildOfferPdfGenerateRequest(state, options);
    if (!request) throw new Error('PDF-запрос не собрался');
    return request;
};

describe('PDF-запрос: наполнение по комплектам на верхнем уровне', () => {
    const twoGarants = () => rootStateWithVariants([], variantItems, twoGarantGeneral());

    it('два комплекта: complects и complectsMode на месте, по умолчанию объединённо', () => {
        const request = requestOf(twoGarants());
        expect(request.complects).toHaveLength(2);
        const supplyName = resolveSupply(variantCatalog, 'internet_5')?.name;
        expect(supplyName).toBeTruthy();
        expect(request.complects?.map(section => section.supplyName)).toEqual([supplyName, supplyName]);
        expect(request.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
        expect(request).not.toHaveProperty('variants');
    });

    it('способ печати из настроек уходит полем верхнего уровня, в settings бэка его нет', () => {
        const request = requestOf(twoGarants(), optionsOf(OFFER_COMPLECTS_MODE.SEPARATE));
        expect(request.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
        expect(request.settings).not.toHaveProperty('complectsMode');
    });

    it('один комплект: разделов нет, способ печати уходит', () => {
        const request = requestOf(rootStateWithVariants([], variantItems));
        expect(request).not.toHaveProperty('complects');
        expect(request.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
    });

    it('смена способа печати меняет ключ превью, и превью пересобирается', () => {
        const state = twoGarants();
        const merged = offerPdfRequestKey(requestOf(state, optionsOf(OFFER_COMPLECTS_MODE.MERGED)));
        const separate = offerPdfRequestKey(requestOf(state, optionsOf(OFFER_COMPLECTS_MODE.SEPARATE)));
        expect(separate).not.toBe(merged);
    });
});

describe('PDF-запрос: наполнение по комплектам у открытого варианта', () => {
    const MODES = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];
    // слепок открытого варианта устарел: один комплект и объединённое наполнение
    const staleRecords = () => [
        recordOf(1, 102, 'buh', snapshotRowsOf(oneGarantGeneral(), pdfOf(OFFER_COMPLECTS_MODE.MERGED))),
        recordOf(2, 104, 'buh', snapshotRowsOf(twoGarantGeneral(), pdfOf(OFFER_COMPLECTS_MODE.MERGED))),
    ];
    const stateOf = (mode: ComplectMode, records = staleRecords()) =>
        rootStateWithVariants(records, variantItems, twoGarantGeneral(), { mode, openVariantSmartId: 102 });

    it.each(MODES)('режим %s: открытый вариант берёт наборы и способ печати из живого состояния', mode => {
        const request = requestOf(stateOf(mode), optionsOf(OFFER_COMPLECTS_MODE.SEPARATE));
        expect(request.variants?.map(variant => variant.variantSmartId)).toEqual([102]);
        const [open] = request.variants ?? [];
        expect(open?.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
        expect(open?.complects).toHaveLength(2);
    });

    it('другие варианты в запрос не идут, их слепки и настройки PDF на запрос не влияют', () => {
        const withOther = stateOf(COMPLECT_MODE.multi_contract);
        const withoutOther = stateOf(COMPLECT_MODE.multi_contract, [staleRecords()[0]!]);
        const options = optionsOf(OFFER_COMPLECTS_MODE.MERGED);
        expect(requestOf(withOther, options).variants?.map(variant => variant.variantSmartId)).toEqual([102]);
        expect(offerPdfRequestKey(requestOf(withOther, options))).toBe(offerPdfRequestKey(requestOf(withoutOther, options)));
    });

    it('смена способа печати в настройках экрана меняет запрос и ключ превью', () => {
        const state = stateOf(COMPLECT_MODE.compare);
        const merged = offerPdfRequestKey(requestOf(state, optionsOf(OFFER_COMPLECTS_MODE.MERGED)));
        const separate = offerPdfRequestKey(requestOf(state, optionsOf(OFFER_COMPLECTS_MODE.SEPARATE)));
        expect(separate).not.toBe(merged);
    });
});
