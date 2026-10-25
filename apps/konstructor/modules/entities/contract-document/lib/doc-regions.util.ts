import type { Catalog } from '../../catalog';
import type { Composition } from '../../composition';
import type { DocRegion, DocRegions } from '../model/dto';

/**
 * Регионы комплекта в легаси-форме RegionsDto: бэк печатает их в списке
 * инфоблоков договора по полю `infoblock` (название регионального блока).
 * Легаси делил на favorite / inComplect / noWidth — в новой модели регион
 * либо в составе, либо нет, поэтому всё в inComplect.
 */
export const buildDocRegions = (catalog: Catalog, composition: Composition): DocRegions => {
    const inComplect: DocRegion[] = composition.regions.flatMap(code => {
        const region = catalog.regions.byCode[code];
        if (!region) return [];
        return [
            {
                number: 0,
                abs: region.abs,
                name: region.code,
                title: region.title,
                infoblock: region.title,
            },
        ];
    });
    return { inComplect, favorite: [], noWidth: [] };
};
