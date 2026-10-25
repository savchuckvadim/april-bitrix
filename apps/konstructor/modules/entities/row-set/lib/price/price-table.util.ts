import type { Catalog, KRegion, KSupply, RegionScope } from '../../../catalog';
import { isCustomSupplyCode, referenceSupplyForCustom } from '../../../catalog';

/**
 * Поиск базовых цен в прайс-таблицах каталога (state.catalog.catalog.prices).
 */

export const regionScope = (region: KRegion): RegionScope =>
    region.code === 'msk' ? 'msk' : 'regions';

/** Базовая цена PROF-комплекта из прайс-таблицы (руб/мес) */
export const findProfBasePrice = (
    catalog: Catalog,
    complectCode: string,
    supplyCode: string,
    scope: RegionScope,
): number | null => {
    const price = catalog.prices.items.find(
        item =>
            item.complectCode === complectCode &&
            item.supplyCode === supplyCode &&
            item.regionScope === scope,
    );
    return price ? price.value : null;
};

/**
 * Базовая PROF-цена с поддержкой X-ОД: справочная поставка — прямой лукап;
 * кастомная — цена ближайшей справочной поставки того же типа (снизу, иначе
 * сверху), нет и такой — 0. Цена X-ОД не вычисляется (решение владельца 14),
 * строка помечается ориентировочной и правится вручную.
 */
export const findProfBasePriceForSupply = (
    catalog: Catalog,
    complectCode: string,
    supply: KSupply,
    scope: RegionScope,
): number | null => {
    if (!isCustomSupplyCode(supply.code)) {
        return findProfBasePrice(catalog, complectCode, supply.code, scope);
    }
    const reference = referenceSupplyForCustom(
        catalog,
        supply.type,
        supply.usersQuantity,
    );
    if (!reference) return 0;
    return findProfBasePrice(catalog, complectCode, reference.code, scope) ?? 0;
};

/** Цена пакета/сервиса (LT-пакет, СТАР) из прайса по packageCode */
export const findPackagePrice = (
    catalog: Catalog,
    packageCode: string,
    scope: RegionScope,
): number | null => {
    const price = catalog.prices.items.find(
        item => item.packageCode === packageCode && item.regionScope === scope,
    );
    return price ? price.value : null;
};
