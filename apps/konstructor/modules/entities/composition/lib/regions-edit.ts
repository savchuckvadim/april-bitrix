import type { KComplect } from '../../catalog';
import type { Composition, CompositionAction } from '../model/types';
import { defaultComposition } from '../model/types';
import { REGION_ROOT_CODE } from './rules/infoblock-links';
import { addUnique, remove, union } from './utils';

/**
 * Регионы в составе: два списка («считать вес» и «не считать») и рутовый блок
 * «Региональное законодательство» (reg). Блок включён ровно тогда, когда в
 * составе есть хоть один регион в любом из списков. Здесь только чистые
 * операции над составом, без каталога и правил комплекта (правила — в
 * rules/regions.ts).
 */

/** Действия над регионами состава (одно правило и одна наивная ветка на все) */
export const REGION_ACTION_KINDS = [
    'toggleRegion',
    'setRegions',
    'toggleRegionWeight',
    'removeRegion',
] as const;

export type RegionAction = Extract<CompositionAction, { kind: (typeof REGION_ACTION_KINDS)[number] }>;

export const isRegionAction = (action: CompositionAction): action is RegionAction =>
    (REGION_ACTION_KINDS as readonly string[]).includes(action.kind);

/** Все регионы состава: и считающие вес, и нет */
export const compositionRegionCodes = (composition: Composition): string[] =>
    union(composition.regions, composition.regionsUnweighted);

export const hasCompositionRegions = (composition: Composition): boolean =>
    composition.regions.length > 0 || composition.regionsUnweighted.length > 0;

interface RegionLists {
    regions: string[];
    regionsUnweighted: string[];
}

/** Код попадает только в один список: «считать вес» побеждает */
const exclusive = (counted: string[], unweighted: string[]): RegionLists => {
    const regions = [...new Set(counted)];
    return {
        regions,
        regionsUnweighted: [...new Set(unweighted)].filter(code => !regions.includes(code)),
    };
};

const editLists = (composition: Composition, action: RegionAction): RegionLists => {
    const { regions, regionsUnweighted } = composition;
    switch (action.kind) {
        case 'toggleRegion':
            // добавленный регион считает вес; уже стоящий в любом списке остаётся там
            if (!action.checked) {
                return {
                    regions: remove(regions, action.code),
                    regionsUnweighted: remove(regionsUnweighted, action.code),
                };
            }
            return regionsUnweighted.includes(action.code)
                ? { regions, regionsUnweighted }
                : { regions: addUnique(regions, action.code), regionsUnweighted };
        case 'setRegions':
            return exclusive(action.counted, action.unweighted);
        case 'toggleRegionWeight':
            return action.counted
                ? exclusive(addUnique(regions, action.code), remove(regionsUnweighted, action.code))
                : exclusive(remove(regions, action.code), addUnique(regionsUnweighted, action.code));
        case 'removeRegion':
            return {
                regions: remove(regions, action.code),
                regionsUnweighted: remove(regionsUnweighted, action.code),
            };
    }
};

/** Рутовый блок следует за регионами: есть регион — блок включён, нет — выключен */
export const syncRegionRoot = (composition: Composition): Composition => {
    const hasRoot = composition.infoblocks.includes(REGION_ROOT_CODE);
    const hasRegions = hasCompositionRegions(composition);
    if (hasRegions === hasRoot) return composition;
    return {
        ...composition,
        infoblocks: hasRegions
            ? addUnique(composition.infoblocks, REGION_ROOT_CODE)
            : remove(composition.infoblocks, REGION_ROOT_CODE),
    };
};

/** Действие над регионами без правил комплекта (свободный режим и основа правила) */
export const applyRegionsEdit = (composition: Composition, action: RegionAction): Composition =>
    syncRegionRoot({ ...composition, ...editLists(composition, action) });

/**
 * Рутовый блок включён, а регионов нет (слепок до модели регионов, новый состав
 * по умолчанию): регионом становится регион клиента, он считает вес.
 */
export const withClientRegion = (
    composition: Composition,
    regionCode: string | null | undefined,
): Composition => {
    if (!regionCode || hasCompositionRegions(composition)) return composition;
    if (!composition.infoblocks.includes(REGION_ROOT_CODE)) return composition;
    return { ...composition, regions: [regionCode] };
};

/** Состав комплекта по умолчанию с регионом клиента, если блок региона входит в умолчания */
export const defaultCompositionFor = (
    complect: KComplect,
    regionCode: string | null | undefined,
): Composition => withClientRegion(defaultComposition(complect), regionCode);

/**
 * Смена региона клиента: старый код заменяется новым в том же списке, новый
 * убирается из соседнего, остальные регионы остаются. Без старого региона в
 * составе состав не меняется (кроме добивки блока без регионов).
 */
export const replaceClientRegion = (
    composition: Composition,
    from: string,
    to: string,
): Composition => {
    if (from === to) return composition;
    const swap = (list: string[]): string[] => [...new Set(list.map(code => (code === from ? to : code)))];

    if (composition.regions.includes(from)) {
        return {
            ...composition,
            regions: swap(composition.regions),
            regionsUnweighted: remove(composition.regionsUnweighted, to),
        };
    }
    if (composition.regionsUnweighted.includes(from)) {
        return {
            ...composition,
            regions: remove(composition.regions, to),
            regionsUnweighted: swap(composition.regionsUnweighted),
        };
    }
    return withClientRegion(composition, to);
};
