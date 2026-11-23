import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { COMPLECT_MODE } from '../../../complect-variant/model/dto';
import {
    catalog,
    comparisonRowOf,
    compositionOf,
    syncedAlternative,
} from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { offerPdfActions, offerPdfReducer } from '../../../offer-pdf/model/OfferPdfSlice';
import type { RowSet } from '../../../row-set';
import { recordOf, variantItems } from '../__fixtures__/variant-records';
import { oneGarantGeneral, rootStateWithVariantsAndTemplate } from '../__fixtures__/variants-state';
import { buildOfferGenerateRequest, buildOfferMultiGenerateRequest, offerVariantsFields } from '../build-offer-request';
import {
    ALTERNATIVE_COMPLECTS_FORMATS,
    alternativeComplectsFields,
    selectAlternativeComplectsEnabled,
} from '../offer-alternative-complects';

/**
 * Формат КП решает, уходит ли наполнение наборов для сравнения: PDF его
 * печатает, Word-шаблоны пока нет.
 */

const urComposition = compositionOf('ur', { infoblocks: ['rus', 'la'], lt: ['ltsut'], regions: ['spb'] });

const alternativeSet = (setId: string): RowSet =>
    syncedAlternative(setId, [comparisonRowOf(`${setId}_row`, setId, 'ur', urComposition)]);

const bareSet = (setId: string): RowSet =>
    syncedAlternative(setId, [comparisonRowOf(`${setId}_row`, setId, 'ur', undefined)]);

/** Состояние с открытым вариантом, выбранным Word-шаблоном, наборами для сравнения и настройкой показа */
const stateOf = (enabled: boolean): RootState => {
    const base = rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems, oneGarantGeneral(), {
        mode: COMPLECT_MODE.compare,
        openVariantSmartId: 102,
    });
    return {
        ...base,
        rowSet: { ...base.rowSet, alternative: [alternativeSet('alt_1'), alternativeSet('alt_2')] },
        offerPdf: offerPdfReducer(base.offerPdf, offerPdfActions.setSettings({ alternativeComplects: enabled })),
    };
};

describe('форматы КП с наполнением наборов для сравнения', () => {
    it('PDF печатает блок, Word пока нет: это единственная точка выбора', () => {
        expect(ALTERNATIVE_COMPLECTS_FORMATS).toEqual({ word: false, pdf: true });
    });

    it('PDF при включённой настройке и наборах с наполнением получает поле', () => {
        const fields = alternativeComplectsFields('pdf', true, catalog, [alternativeSet('alt_1')]);
        expect(fields.alternativeComplects?.map(item => [item.setNumber, item.title])).toEqual([[1, 'Набор 1']]);
    });

    it('настройка выключена — пустой объект', () => {
        expect(alternativeComplectsFields('pdf', false, catalog, [alternativeSet('alt_1')])).toEqual({});
    });

    it('Word поле не получает, даже когда настройка включена', () => {
        expect(alternativeComplectsFields('word', true, catalog, [alternativeSet('alt_1')])).toEqual({});
    });

    it('наборов с наполнением нет — пустой объект', () => {
        expect(alternativeComplectsFields('pdf', true, catalog, [])).toEqual({});
        expect(alternativeComplectsFields('pdf', true, catalog, [bareSet('alt_1')])).toEqual({});
    });
});

describe('Word-запросы не шлют наполнение наборов для сравнения', () => {
    it('настройка читается из настроек PDF-КП', () => {
        expect(selectAlternativeComplectsEnabled(stateOf(true))).toBe(true);
        expect(selectAlternativeComplectsEnabled(stateOf(false))).toBe(false);
    });

    it('тело КП в Word: поля нет при любой настройке', () => {
        for (const enabled of [true, false]) {
            const request = buildOfferGenerateRequest(stateOf(enabled));
            expect(request).not.toBeNull();
            expect(request).not.toHaveProperty('alternativeComplects');
        }
    });

    it('generate-multi и превью Word: ни у КП, ни у участника поля нет', () => {
        const state = stateOf(true);
        const multi = buildOfferMultiGenerateRequest(state);
        expect(multi?.variants).toHaveLength(1);
        expect(multi).not.toHaveProperty('alternativeComplects');
        expect(multi?.variants[0]).not.toHaveProperty('alternativeComplects');

        const preview = offerVariantsFields(state);
        expect(preview.variants).toHaveLength(1);
        expect(preview.variants?.[0]).not.toHaveProperty('alternativeComplects');
    });
});
