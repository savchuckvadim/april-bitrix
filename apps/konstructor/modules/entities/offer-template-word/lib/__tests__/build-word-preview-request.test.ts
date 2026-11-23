import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import {
    complectVariantActions,
    complectVariantReducer,
    selectComposition,
} from '../../../complect-variant/model/ComplectVariantSlice';
import { COMPLECT_MODE, DEFAULT_COMPLECT_COMPOSITION } from '../../../complect-variant/model/dto';
import { buildOfferGenerateRequest, offerRequestBlocker } from '../../../offer-document/lib/build-offer-request';
import { recordOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import {
    rootStateWithVariants,
    rootStateWithVariantsAndTemplate,
} from '../../../offer-document/lib/__fixtures__/variants-state';
import { buildWordPreviewRequest } from '../build-word-preview-request';

describe('тело превью Word-КП', () => {
    // адаптер ставит метки времени при каждой сборке: фиксируем часы, чтобы сравнивать тела целиком
    beforeAll(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-11-23T12:00:00.000Z'));
    });
    afterAll(() => {
        vi.useRealTimers();
    });

    it('участников нет — тело такое же, как у формирования, без variants и composition', () => {
        const state = rootStateWithVariantsAndTemplate([], variantItems);
        const request = buildWordPreviewRequest(state);
        expect(request).not.toBeNull();
        expect(request).toEqual(buildOfferGenerateRequest(state));
        expect(request).not.toHaveProperty('variants');
        expect(request).not.toHaveProperty('composition');
    });

    it('участники есть — variants и composition на месте, остальное тело прежнее', () => {
        const state = rootStateWithVariantsAndTemplate(
            [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')],
            variantItems,
        );
        const request = buildWordPreviewRequest(state);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([102, 104]);
        expect(request?.composition).toEqual(DEFAULT_COMPLECT_COMPOSITION);
        expect(request).toEqual({
            ...buildOfferGenerateRequest(state),
            variants: request?.variants,
            composition: DEFAULT_COMPLECT_COMPOSITION,
        });
    });

    it('настройки сделки уходят как есть: режим и печать', () => {
        const base = rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems);
        const composition = { ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.multi_contract };
        const state: RootState = {
            ...base,
            complectVariant: complectVariantReducer(
                base.complectVariant,
                complectVariantActions.setComposition(composition),
            ),
        };
        expect(selectComposition(state).mode).toBe(COMPLECT_MODE.multi_contract);
        expect(buildWordPreviewRequest(state)?.composition).toEqual(composition);
    });

    it('участник, которого собрать нельзя, блокирует превью тем же блокером, что формирование', () => {
        const state = rootStateWithVariantsAndTemplate([recordOf(2, 102, 'buh', '{broken')], variantItems);
        expect(offerRequestBlocker(state)).toContain('Вариант «Юристу» нельзя включить в документ');
        expect(buildWordPreviewRequest(state)).toBeNull();
    });

    it('пока стадии вариантов грузятся, превью не собирается', () => {
        const state = rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems);
        const loading: RootState = {
            ...state,
            complectVariant: { ...state.complectVariant, itemsStatus: 'loading' },
        };
        expect(offerRequestBlocker(loading)).toBe('Варианты КП ещё загружаются');
        expect(buildWordPreviewRequest(loading)).toBeNull();
    });

    it('без выбранного Word-шаблона превью не собирается', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems);
        expect(buildWordPreviewRequest(state)).toBeNull();
    });
});
