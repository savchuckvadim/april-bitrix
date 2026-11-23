import { describe, expect, it } from 'vitest';
import {
    COMPLECT_MODE,
    COMPLECT_OFFER_INFOBLOCKS,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectComposition,
} from '../model/dto';
import { isSameOfferComposition, toOfferComposition } from './offer-composition';

describe('настройки сделки для КП', () => {
    it('режим всегда compare, остальные поля как в сделке', () => {
        const composition = {
            ...DEFAULT_COMPLECT_COMPOSITION,
            mode: COMPLECT_MODE.single_contract,
            openVariantSmartId: 7,
        };
        expect(toOfferComposition(composition)).toEqual({ ...composition, mode: COMPLECT_MODE.compare });
    });

    it('исходный объект не меняется', () => {
        const composition = { ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.multi_contract };
        toOfferComposition(composition);
        expect(composition.mode).toBe(COMPLECT_MODE.multi_contract);
    });
});

describe('равенство настроек сделки с точки зрения КП', () => {
    it('отличие только в режиме: настройки равны', () => {
        expect(
            isSameOfferComposition(DEFAULT_COMPLECT_COMPOSITION, {
                ...DEFAULT_COMPLECT_COMPOSITION,
                mode: COMPLECT_MODE.multi_contract,
            }),
        ).toBe(true);
    });

    it('другой открытый вариант: настройки различаются', () => {
        expect(
            isSameOfferComposition(DEFAULT_COMPLECT_COMPOSITION, { ...DEFAULT_COMPLECT_COMPOSITION, openVariantSmartId: 5 }),
        ).toBe(false);
    });

    it('открытый вариант null и отсутствующий равны', () => {
        const withoutOpen: ComplectComposition = {
            mode: DEFAULT_COMPLECT_COMPOSITION.mode,
            offer: DEFAULT_COMPLECT_COMPOSITION.offer,
        };
        expect(isSameOfferComposition(DEFAULT_COMPLECT_COMPOSITION, withoutOpen)).toBe(true);
    });

    it('другие инфоблоки КП: настройки различаются', () => {
        expect(
            isSameOfferComposition(DEFAULT_COMPLECT_COMPOSITION, {
                ...DEFAULT_COMPLECT_COMPOSITION,
                offer: { ...DEFAULT_COMPLECT_COMPOSITION.offer, infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged },
            }),
        ).toBe(false);
    });

    it('порядок ключей в блоке КП значения не имеет', () => {
        expect(
            isSameOfferComposition(
                { ...DEFAULT_COMPLECT_COMPOSITION, offer: { infoblocks: COMPLECT_OFFER_INFOBLOCKS.independent, showAlternatives: false } },
                { ...DEFAULT_COMPLECT_COMPOSITION, offer: { showAlternatives: false, infoblocks: COMPLECT_OFFER_INFOBLOCKS.independent } },
            ),
        ).toBe(true);
    });
});
