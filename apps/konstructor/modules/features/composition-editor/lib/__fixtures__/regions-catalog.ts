import oldInit from '../../../../entities/catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit, type Catalog, type KRegion } from '@/modules/entities/catalog';

const base = catalogFromOldInit(oldInit);

/** Регионы как отдаёт бэк: Москва весит 1, остальные 0.5; портал привязал только Москву и Ставрополь */
const regions: KRegion[] = base.regions.items.map(region => ({
    ...region,
    weight: region.code === 'msk' ? 1 : 0.5,
    inPortal: region.code === 'msk' || region.code === 'stv',
}));

/** Каталог старого init с регионами, как их отдаёт init v2 */
export const regionsCatalog: Catalog = {
    ...base,
    regions: {
        items: regions,
        byCode: Object.fromEntries(regions.map(region => [region.code, region])),
    },
};
