import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { COMPLECT_MODE } from '../../../complect-variant/model/dto';
import { buildWordPreviewRequest } from '../../../offer-template-word/lib/build-word-preview-request';
import { offerPdfActions, offerPdfReducer } from '../../../offer-pdf/model/OfferPdfSlice';
import { recordOf, variantItems } from '../__fixtures__/variant-records';
import { oneGarantGeneral, rootStateWithVariantsAndTemplate } from '../__fixtures__/variants-state';
import { buildOfferGenerateRequest, buildOfferMultiGenerateRequest } from '../build-offer-request';
import { offerLetterFields, selectOfferWithLetter } from '../offer-letter';

/**
 * Сопроводительное письмо в Word-запросах: флаг хранят настройки PDF-КП, в
 * запрос он уходит только выключенным (`withLetter: false`), включённое письмо
 * оставляет запрос таким, каким он был до флага.
 */

/** Состояние с открытым вариантом и выбранным Word-шаблоном; письмо включено или выключено */
const stateOf = (withLetter?: boolean): RootState => {
    const base = rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems, oneGarantGeneral(), {
        mode: COMPLECT_MODE.compare,
        openVariantSmartId: 102,
    });
    return withLetter === undefined
        ? base
        : { ...base, offerPdf: offerPdfReducer(base.offerPdf, offerPdfActions.setSettings({ withLetter })) };
};

describe('флаг письма из настроек КП', () => {
    it('по умолчанию письмо включено', () => {
        expect(selectOfferWithLetter(stateOf())).toBe(true);
        expect(selectOfferWithLetter(stateOf(true))).toBe(true);
        expect(selectOfferWithLetter(stateOf(false))).toBe(false);
    });

    it('поле запроса есть только у выключенного письма', () => {
        expect(offerLetterFields(true)).toEqual({});
        expect(offerLetterFields(false)).toEqual({ withLetter: false });
    });
});

describe('Word-запросы и сопроводительное письмо', () => {
    it('письмо включено: ни в теле КП, ни в generate-multi, ни в превью поля нет', () => {
        for (const state of [stateOf(), stateOf(true)]) {
            expect(buildOfferGenerateRequest(state)).not.toHaveProperty('withLetter');
            expect(buildOfferMultiGenerateRequest(state)).not.toHaveProperty('withLetter');
            expect(buildWordPreviewRequest(state)).not.toHaveProperty('withLetter');
        }
    });

    it('письмо выключено: тело КП, generate-multi и превью несут withLetter: false', () => {
        const state = stateOf(false);
        expect(buildOfferGenerateRequest(state)?.withLetter).toBe(false);
        expect(buildOfferMultiGenerateRequest(state)?.withLetter).toBe(false);
        expect(buildWordPreviewRequest(state)?.withLetter).toBe(false);
    });

    it('флаг лежит на верхнем уровне запроса, у участника-варианта его нет', () => {
        const multi = buildOfferMultiGenerateRequest(stateOf(false));
        expect(multi?.variants).toHaveLength(1);
        expect(multi?.variants[0]).not.toHaveProperty('withLetter');
    });
});
