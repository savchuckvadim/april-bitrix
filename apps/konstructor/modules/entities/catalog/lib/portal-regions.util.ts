import type { KRegion } from '../model/types';

/**
 * Регионы для выбора: портальные (portal_region), полный справочник — по
 * запросу. Портал без привязок видит весь справочник. Текущий регион в списке
 * всегда: его могли выбрать из полного списка или вспомнить из слепка.
 */
export const hasPortalRegions = (regions: KRegion[]): boolean =>
    regions.some(region => region.inPortal);

export const selectableRegions = (
    regions: KRegion[],
    options: { showAll: boolean; currentCode: string | null },
): KRegion[] => {
    if (options.showAll || !hasPortalRegions(regions)) return regions;
    return regions.filter(
        region => region.inPortal || region.code === options.currentCode,
    );
};
