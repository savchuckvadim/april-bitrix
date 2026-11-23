import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import {
    complectVariantActions,
    complectVariantReducer,
} from '../../../complect-variant/model/ComplectVariantSlice';
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
 * печати на верхнем уровне и у каждого участника.
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

/** Слепок без поля способа печати: так писали до наполнения по комплектам. */
const legacyRowsOf = (general: ReturnType<typeof twoGarantGeneral>): string => {
    const snapshot: Record<string, unknown> = JSON.parse(snapshotRowsOf(general));
    return JSON.stringify({
        ...snapshot,
        pdf: { format: 'pdf', templateCode: 'classic', palette: null, settings: { withPromo: false } },
    });
};

const withOpenVariant = (state: RootState, variantSmartId: number): RootState => ({
    ...state,
    complectVariant: complectVariantReducer(state.complectVariant, complectVariantActions.setOpenVariant(variantSmartId)),
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

describe('PDF-запрос: наполнение по комплектам у участников', () => {
    const recordWith = (id: number, variantSmartId: number, rows: string) => recordOf(id, variantSmartId, 'buh', rows);

    it('у каждого участника свои комплекты и свой способ печати из его слепка', () => {
        const state = rootStateWithVariants(
            [
                recordWith(1, 102, snapshotRowsOf(twoGarantGeneral(), pdfOf(OFFER_COMPLECTS_MODE.SEPARATE))),
                recordWith(2, 104, snapshotRowsOf(twoGarantGeneral(), pdfOf(OFFER_COMPLECTS_MODE.MERGED))),
                recordWith(3, 106, snapshotRowsOf(oneGarantGeneral(), pdfOf(OFFER_COMPLECTS_MODE.SEPARATE))),
            ],
            variantItems,
            twoGarantGeneral(),
        );
        const request = requestOf(state, optionsOf(OFFER_COMPLECTS_MODE.MERGED));
        expect(request.variants?.map(variant => variant.variantSmartId)).toEqual([102, 104, 106]);
        expect(request.variants?.map(variant => variant.complectsMode)).toEqual([
            OFFER_COMPLECTS_MODE.SEPARATE,
            OFFER_COMPLECTS_MODE.MERGED,
            OFFER_COMPLECTS_MODE.SEPARATE,
        ]);
        expect(request.variants?.map(variant => variant.complects?.length)).toEqual([2, 2, undefined]);
        expect(request.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
    });

    it('открытый вариант берёт наборы и способ печати из живого состояния', () => {
        const state = withOpenVariant(
            rootStateWithVariants(
                [
                    // слепок открытого варианта устарел: один комплект и объединённое наполнение
                    recordWith(1, 102, snapshotRowsOf(oneGarantGeneral(), pdfOf(OFFER_COMPLECTS_MODE.MERGED))),
                    recordWith(2, 104, snapshotRowsOf(twoGarantGeneral(), pdfOf(OFFER_COMPLECTS_MODE.MERGED))),
                ],
                variantItems,
                twoGarantGeneral(),
            ),
            102,
        );
        const request = requestOf(state, optionsOf(OFFER_COMPLECTS_MODE.SEPARATE));
        const [open, other] = request.variants ?? [];
        expect(open?.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
        expect(open?.complects).toHaveLength(2);
        // остальные участники живых настроек не получают
        expect(other?.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
    });

    it('слепок без настроек PDF и слепок без поля способа печати читаются как объединённое наполнение', () => {
        const state = rootStateWithVariants(
            [
                recordWith(1, 102, snapshotRowsOf(twoGarantGeneral())),
                recordWith(2, 104, legacyRowsOf(twoGarantGeneral())),
            ],
            variantItems,
            twoGarantGeneral(),
        );
        const request = requestOf(state, optionsOf(OFFER_COMPLECTS_MODE.SEPARATE));
        expect(request.variants?.map(variant => variant.complectsMode)).toEqual([
            OFFER_COMPLECTS_MODE.MERGED,
            OFFER_COMPLECTS_MODE.MERGED,
        ]);
    });

    it('смена способа печати в слепке участника меняет запрос и ключ превью', () => {
        const stateOf = (mode: OfferComplectsMode) =>
            rootStateWithVariants(
                [recordWith(1, 102, snapshotRowsOf(twoGarantGeneral(), pdfOf(mode)))],
                variantItems,
                twoGarantGeneral(),
            );
        const merged = offerPdfRequestKey(requestOf(stateOf(OFFER_COMPLECTS_MODE.MERGED)));
        const separate = offerPdfRequestKey(requestOf(stateOf(OFFER_COMPLECTS_MODE.SEPARATE)));
        expect(separate).not.toBe(merged);
    });
});
