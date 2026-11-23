import { describe, expect, it } from 'vitest';
import {
    COMPLECT_MODE,
    COMPLECT_OFFER_INFOBLOCKS,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectComposition,
} from '../model/dto';
import { mergeComposition } from './merge-composition';

const withAlternatives: ComplectComposition = {
    mode: COMPLECT_MODE.compare,
    offer: { infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged, showAlternatives: true },
    openVariantSmartId: 5,
};

describe('сохранение настроек сборки', () => {
    it('showAlternatives пишется false даже при сохранённом true', () => {
        const merged = mergeComposition(withAlternatives, { mode: COMPLECT_MODE.multi_contract });
        expect(merged.offer.showAlternatives).toBe(false);
    });

    it('правка блока КП не возвращает showAlternatives', () => {
        const merged = mergeComposition(DEFAULT_COMPLECT_COMPOSITION, {
            offer: { infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged, showAlternatives: true },
        });
        expect(merged.offer).toEqual({ infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged, showAlternatives: false });
    });

    it('смена режима оставляет остальные настройки как были', () => {
        const merged = mergeComposition(withAlternatives, { mode: COMPLECT_MODE.single_contract });
        expect(merged).toEqual({
            mode: COMPLECT_MODE.single_contract,
            offer: { infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged, showAlternatives: false },
            openVariantSmartId: 5,
        });
    });

    it('указатель открытого варианта меняется отдельно от режима', () => {
        const merged = mergeComposition(withAlternatives, { openVariantSmartId: null });
        expect(merged.mode).toBe(COMPLECT_MODE.compare);
        expect(merged.openVariantSmartId).toBeNull();
    });
});
