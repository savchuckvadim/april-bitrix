import type { KComplect } from '../../catalog';
import { getComplectRuleFlags } from '../../catalog';
import type { Composition, CompositionCtx } from '../model/types';
import { REGION_ROOT_CODE } from './rules/infoblock-links';

/**
 * Вес состава (перенос legacy weight.js + region-util.ts):
 * Σ весов инфоблоков (кроме «Регионального законодательства» — reg)
 * + Σ весов отдельных ЭР (0.5) + вес активных пакетов ЭР (1)
 * + регионы «считать вес»: вес каждого из каталога (KRegion.weight: Москва 1,
 * остальные 0.5; регион без записи в каталоге — 0). Регионы «не считать» и
 * сам рутовый блок reg веса не дают: блок следует за регионами и «весит» ровно
 * столько, сколько его регионы.
 */

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
        weight += ctx.catalog.regions.byCode[code]?.weight ?? 0;
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

    // флаг weightAtLeast (Максимум): допустим вес ≥ эталона
    const matches = getComplectRuleFlags(ctx.complect).weightAtLeast
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
