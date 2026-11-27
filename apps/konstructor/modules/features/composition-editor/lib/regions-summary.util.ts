import type { Catalog } from '@/modules/entities/catalog';
import {
    compositionRegionCodes,
    regionCodesWeight,
    type Composition,
} from '@/modules/entities/composition';

/** Что показать у регионального блока на экране наполнения */
export interface RegionsSummary {
    /** Название блока: законодательство региона клиента или общее название */
    title: string;
    /** Вес регионов состава (только считающие вес) */
    weight: number;
    /** Хвост строки под блоком: «регион клиента · а также: …»; пусто, если блок назван одним регионом клиента */
    details: string;
}

export const REGION_ROOT_TITLE = 'Региональное законодательство';

const regionTitle = (catalog: Catalog, code: string, unweighted: boolean): string => {
    const title = catalog.regions.byCode[code]?.title ?? code;
    return unweighted ? `${title} (без веса)` : title;
};

/**
 * Название блока — законодательство региона клиента, когда регион один и это
 * регион клиента; иначе общее «Региональное законодательство». Под блоком
 * вес регионов и перечень: регион клиента, затем «а также» остальные.
 */
export const describeRegions = (
    catalog: Catalog,
    composition: Composition,
    clientRegionCode: string | null,
    rootName: string = REGION_ROOT_TITLE,
): RegionsSummary => {
    const codes = compositionRegionCodes(composition);
    const weight = regionCodesWeight(composition.regions, catalog);
    const client = clientRegionCode ? catalog.regions.byCode[clientRegionCode] : undefined;
    const isOnlyClient = codes.length === 1 && codes[0] === clientRegionCode;

    if (isOnlyClient && client?.infoblock) {
        return { title: client.infoblock, weight, details: '' };
    }

    const clientInList = Boolean(clientRegionCode && codes.includes(clientRegionCode));
    const others = codes
        .filter(code => code !== clientRegionCode)
        .map(code => regionTitle(catalog, code, composition.regionsUnweighted.includes(code)));
    const parts: string[] = [];
    if (clientInList && clientRegionCode) {
        parts.push(regionTitle(catalog, clientRegionCode, composition.regionsUnweighted.includes(clientRegionCode)));
    }
    if (others.length) parts.push(`${clientInList ? 'а также' : 'регионы'}: ${others.join(', ')}`);

    return { title: rootName, weight, details: parts.join(' · ') };
};
