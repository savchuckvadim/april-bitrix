import { selectableRegions, type Catalog, type KRegion } from '@/modules/entities/catalog';
import {
    regionCodesWeight,
    type Composition,
    type CompositionAction,
} from '@/modules/entities/composition';

/**
 * Окно «Регионы»: черновик выбора (регионы «считать вес» и «не считать»),
 * поиск, фильтры и итог веса. Чистые функции без React: хук окна держит только
 * состояние, остальное считается здесь.
 */

export type RegionsFilter = 'all' | 'selected' | 'counted' | 'unweighted';

export const REGIONS_FILTERS: readonly { id: RegionsFilter; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'selected', label: 'Отмеченные' },
    { id: 'counted', label: 'Считать вес' },
    { id: 'unweighted', label: 'Не считать' },
];

export interface RegionsDraft {
    /** Регионы, которые считают вес */
    counted: string[];
    /** Регионы без веса */
    unweighted: string[];
}

export interface RegionPickerRow {
    region: KRegion;
    selected: boolean;
    /** Считает вес (имеет смысл только у отмеченного) */
    counted: boolean;
}

export const draftFromComposition = (composition: Composition): RegionsDraft => ({
    counted: [...composition.regions],
    unweighted: [...composition.regionsUnweighted],
});

export const draftCodes = (draft: RegionsDraft): string[] => [...draft.counted, ...draft.unweighted];

export const isRegionSelected = (draft: RegionsDraft, code: string): boolean =>
    draft.counted.includes(code) || draft.unweighted.includes(code);

/** Отметить или снять регион: добавленный регион по умолчанию считает вес */
export const toggleDraftRegion = (draft: RegionsDraft, code: string): RegionsDraft =>
    isRegionSelected(draft, code)
        ? {
              counted: draft.counted.filter(item => item !== code),
              unweighted: draft.unweighted.filter(item => item !== code),
          }
        : { counted: [...draft.counted, code], unweighted: draft.unweighted };

/** Считать вес региона или нет; регион, не отмеченный в черновике, не меняется */
export const setDraftRegionCounted = (draft: RegionsDraft, code: string, counted: boolean): RegionsDraft => {
    if (!isRegionSelected(draft, code)) return draft;
    const others = (list: string[]) => list.filter(item => item !== code);
    return counted
        ? { counted: [...others(draft.counted), code], unweighted: others(draft.unweighted) }
        : { counted: others(draft.counted), unweighted: [...others(draft.unweighted), code] };
};

/** Вес черновика: только регионы «считать вес» */
export const draftWeight = (draft: RegionsDraft, catalog: Catalog): number =>
    regionCodesWeight(draft.counted, catalog);

const sameCodes = (a: string[], b: string[]): boolean =>
    a.length === b.length && a.every(code => b.includes(code));

export const isDraftChanged = (draft: RegionsDraft, initial: RegionsDraft): boolean =>
    !sameCodes(draft.counted, initial.counted) || !sameCodes(draft.unweighted, initial.unweighted);

export const draftToAction = (draft: RegionsDraft): CompositionAction => ({
    kind: 'setRegions',
    counted: draft.counted,
    unweighted: draft.unweighted,
});

/**
 * Регионы для выбора: регионы портала, а с переключателем «Все регионы» весь
 * справочник (регионы портала первыми). Отмеченные регионы видны всегда, даже
 * если портал их не привязал; порядок справочника сохраняется.
 */
export const pickerRegions = (
    all: KRegion[],
    options: { showAll: boolean; clientRegionCode: string | null; selectedCodes: string[] },
): KRegion[] => {
    const visible = new Set(
        selectableRegions(all, { showAll: options.showAll, currentCode: options.clientRegionCode }).map(
            region => region.code,
        ),
    );
    const regions = all.filter(region => visible.has(region.code) || options.selectedCodes.includes(region.code));
    return options.showAll ? [...regions].sort((a, b) => Number(b.inPortal) - Number(a.inPortal)) : regions;
};

const matchesQuery = (region: KRegion, query: string): boolean => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return region.title.toLowerCase().includes(needle) || region.infoblock.toLowerCase().includes(needle);
};

const matchesFilter = (row: RegionPickerRow, filter: RegionsFilter): boolean => {
    switch (filter) {
        case 'all':
            return true;
        case 'selected':
            return row.selected;
        case 'counted':
            return row.selected && row.counted;
        case 'unweighted':
            return row.selected && !row.counted;
    }
};

export const buildPickerRows = (
    regions: KRegion[],
    draft: RegionsDraft,
    query: string,
    filter: RegionsFilter,
): RegionPickerRow[] =>
    regions
        .map(region => ({
            region,
            selected: isRegionSelected(draft, region.code),
            counted: draft.counted.includes(region.code),
        }))
        .filter(row => matchesQuery(row.region, query) && matchesFilter(row, filter));

/** Сколько регионов в каждом фильтре: число на чипе помогает не пропустить отмеченное */
export const filterCounts = (draft: RegionsDraft): Record<RegionsFilter, number | null> => ({
    all: null,
    selected: draft.counted.length + draft.unweighted.length,
    counted: draft.counted.length,
    unweighted: draft.unweighted.length,
});
