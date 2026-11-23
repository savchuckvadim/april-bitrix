import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import {
    complectVariantActions,
    complectVariantReducer,
    selectComposition,
} from '../../../complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    COMPLECT_OFFER_INFOBLOCKS,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
} from '../../../complect-variant/model/dto';
import { buildOfferGenerateRequest, offerRequestBlocker } from '../../../offer-document/lib/build-offer-request';
import { mainSetOf, recordOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import {
    rootStateWithVariants,
    rootStateWithVariantsAndTemplate,
} from '../../../offer-document/lib/__fixtures__/variants-state';
import { createSet, upsertRow } from '../../../row-set';
import { buildWordPreviewRequest } from '../build-word-preview-request';

const ALL_MODES: ComplectMode[] = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];

const withComposition = (state: RootState, composition: typeof DEFAULT_COMPLECT_COMPOSITION): RootState => ({
    ...state,
    complectVariant: complectVariantReducer(state.complectVariant, complectVariantActions.setComposition(composition)),
});

describe('тело превью Word-КП', () => {
    // адаптер ставит метки времени при каждой сборке: фиксируем часы, чтобы сравнивать тела целиком
    beforeAll(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-11-23T12:00:00.000Z'));
    });
    afterAll(() => {
        vi.useRealTimers();
    });

    it('открытого варианта нет — тело такое же, как у формирования, без variants и composition', () => {
        const state = rootStateWithVariantsAndTemplate([], variantItems);
        const request = buildWordPreviewRequest(state);
        expect(request).not.toBeNull();
        expect(request).toEqual(buildOfferGenerateRequest(state));
        expect(request).not.toHaveProperty('variants');
        expect(request).not.toHaveProperty('composition');
    });

    it.each(ALL_MODES)('режим %s: открытый вариант — variants и composition на месте, остальное тело прежнее', mode => {
        const state = rootStateWithVariantsAndTemplate(
            [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')],
            variantItems,
            undefined,
            { mode, openVariantSmartId: 104 },
        );
        const composition = { ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.compare };
        const request = buildWordPreviewRequest(state);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([104]);
        expect(request?.composition).toEqual(composition);
        expect(request).toEqual({
            ...buildOfferGenerateRequest(state),
            variants: request?.variants,
            composition,
        });
    });

    it('тело превью совпадает при всех трёх режимах', () => {
        const stateOf = (mode: ComplectMode) =>
            rootStateWithVariantsAndTemplate(
                [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')],
                variantItems,
                undefined,
                { mode, openVariantSmartId: 104 },
            );
        const baseline = buildWordPreviewRequest(stateOf(COMPLECT_MODE.compare));
        expect(baseline).not.toBeNull();
        for (const mode of ALL_MODES) expect(buildWordPreviewRequest(stateOf(mode))).toEqual(baseline);
    });

    it.each(ALL_MODES)('режим %s: открытого варианта нет — тело без variants и composition', mode => {
        const state = rootStateWithVariantsAndTemplate(
            [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')],
            variantItems,
            undefined,
            { mode, openVariantSmartId: null },
        );
        const request = buildWordPreviewRequest(state);
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('variants');
        expect(request).not.toHaveProperty('composition');
    });

    it('настройки сделки уходят с режимом compare, печать КП как есть', () => {
        const base = rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems, undefined, {
            openVariantSmartId: 102,
        });
        const composition = {
            ...DEFAULT_COMPLECT_COMPOSITION,
            mode: COMPLECT_MODE.multi_contract,
            offer: { ...DEFAULT_COMPLECT_COMPOSITION.offer, infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged },
        };
        const state = withComposition(base, composition);
        expect(selectComposition(state).mode).toBe(COMPLECT_MODE.multi_contract);
        expect(buildWordPreviewRequest(state)?.composition).toEqual({ ...composition, mode: COMPLECT_MODE.compare });
    });

    it('открытый вариант, который собрать нельзя, блокирует превью тем же блокером, что формирование', () => {
        const main = mainSetOf('live', 'buh').rows[0]!;
        const broken = upsertRow(createSet('general', 'general'), {
            ...main,
            refs: { ...main.refs, contractCode: 'no-such-contract' },
        });
        const state = rootStateWithVariantsAndTemplate([recordOf(2, 102, 'buh')], variantItems, broken, {
            mode: COMPLECT_MODE.multi_contract,
            openVariantSmartId: 102,
        });
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
