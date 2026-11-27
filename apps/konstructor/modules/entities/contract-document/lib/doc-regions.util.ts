import type { Catalog } from '../../catalog';
import { REGION_ROOT_CODE, type Composition } from '../../composition';
import type { DocRegion, DocRegions } from '../model/dto';

const toDocRegion = (catalog: Catalog, code: string): DocRegion[] => {
    const region = catalog.regions.byCode[code];
    if (!region) return [];
    return [
        {
            number: 0,
            abs: region.abs,
            name: region.code,
            title: region.title,
            // бэк печатает в списке инфоблоков полное название законодательства
            infoblock: region.infoblock || region.title,
        },
    ];
};

/**
 * Регионы комплекта в легаси-форме RegionsDto: inComplect — регионы, считающие
 * вес, noWidth — не считающие (favorite в новой модели нет). Бэк печатает их в
 * списке инфоблоков договора по полю `infoblock`. Рутовый блок «Региональное
 * законодательство» снят — регионов нет, как в легаси: без блока бэк иначе
 * напечатал бы регионы отдельным списком.
 */
export const buildDocRegions = (catalog: Catalog, composition: Composition): DocRegions => {
    if (!composition.infoblocks.includes(REGION_ROOT_CODE)) {
        return { inComplect: [], favorite: [], noWidth: [] };
    }
    return {
        inComplect: composition.regions.flatMap(code => toDocRegion(catalog, code)),
        favorite: [],
        noWidth: composition.regionsUnweighted.flatMap(code => toDocRegion(catalog, code)),
    };
};
