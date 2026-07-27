import type { KComplect } from '../../catalog';
import type { Composition, CompositionCtx } from '../model/types';

/**
 * Вес состава (перенос legacy weight.js + region-util.ts):
 * Σ весов инфоблоков (кроме «Регионального законодательства» — reg)
 * + Σ весов отдельных ЭР (0.5) + вес активных пакетов ЭР (1)
 * + регионы: каждый ×0.5 + рутовый блок reg ×0.5 (если есть регионы или блок).
 */

/** Комплект «Максимум»: допустим вес ≥ эталона */
const MAXIMUM_CODE = 'maximum';
const REGION_ROOT_CODE = 'reg';
export const WEIGHT_TOLERANCE = 0.01;

export const compositionWeight = (
    composition: Composition,
    ctx: CompositionCtx,
): number => {
    // Источник истины по весам — каталог (БД, init v2).
    // Числовые fallback'и — только на случай отсутствия записи в каталоге.
    let weight = 0;

    for (const code of composition.infoblocks) {
        if (code === REGION_ROOT_CODE) continue;
        weight += ctx.catalog.infoblocks[code]?.weight ?? 0;
    }

    for (const code of composition.ers) {
        weight += ctx.catalog.infoblocks[code]?.weight ?? 0.5;
    }
    for (const code of composition.erPackets) {
        weight += ctx.catalog.infoblocks[code]?.weight ?? 1;
    }
    // ersInPacket весят 0

    for (const code of composition.regions) {
        weight += ctx.catalog.regions.byCode[code]?.weight ?? 0.5;
    }
    const hasRegionRoot =
        composition.infoblocks.includes(REGION_ROOT_CODE) ||
        composition.regions.length > 0;
    if (hasRegionRoot) {
        weight += ctx.catalog.infoblocks[REGION_ROOT_CODE]?.weight ?? 0.5;
    }

    return Math.round(weight * 100) / 100;
};

export interface WeightCheck {
    weight: number;
    expected: number;
    matches: boolean;
    difference: number;
}

export const checkComplectWeight = (
    composition: Composition,
    ctx: CompositionCtx,
): WeightCheck => {
    const weight = compositionWeight(composition, ctx);
    const expected = ctx.complect.weight;

    const matches =
        ctx.complect.code === MAXIMUM_CODE
            ? weight >= expected - WEIGHT_TOLERANCE
            : Math.abs(weight - expected) <= WEIGHT_TOLERANCE;

    return {
        weight,
        expected,
        matches,
        difference: Math.round((weight - expected) * 100) / 100,
    };
};

/**
 * Подбор универсального комплекта по весу (legacy
 * SET_WEIGHT_AND_NAME_OF_UNIVERSAL_COMPLECT): точное совпадение — берём его;
 * иначе — наибольший комплект с весом меньше текущего; нет такого — null.
 */
export const pickUniversalComplect = (
    weight: number,
    universals: KComplect[],
): KComplect | null => {
    const sorted = [...universals].sort((a, b) => a.weight - b.weight);
    const exact = sorted.find(
        complect => Math.abs(complect.weight - weight) <= WEIGHT_TOLERANCE,
    );
    if (exact) return exact;

    let previous: KComplect | null = null;
    for (const complect of sorted) {
        if (complect.weight > weight) return previous;
        previous = complect;
    }
    return previous;
};
