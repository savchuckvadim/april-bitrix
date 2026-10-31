import type { ComboboxOption } from '@workspace/april-ui/fields';
import type { PortalRegion } from '../model';

/** Регионы как варианты источника: подпись справа — их общий рабс */
export const toSourceOptions = (regions: PortalRegion[]): ComboboxOption[] =>
    regions.map(region => ({
        value: String(region.id),
        label: region.title,
        hint: String(region.abs),
        keywords: [region.code],
    }));

/** Регион не может брать рабс сам у себя */
export const withoutRegion = (
    options: ComboboxOption[],
    regionId: number,
): ComboboxOption[] =>
    options.filter(option => option.value !== String(regionId));

/** Подпись своей цены для карточки региона */
export const ownPriceLabel = (region: PortalRegion): string => {
    if (region.own_abs_region_title) {
        return `как у региона: ${region.own_abs_region_title}`;
    }
    return region.own_abs ? String(region.own_abs) : 'не задан';
};
