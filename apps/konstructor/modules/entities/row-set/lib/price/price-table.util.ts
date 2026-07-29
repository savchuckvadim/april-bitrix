import type { Catalog, KRegion, KSupply, RegionScope } from '../../../catalog';
import {
    interpolateByOd,
    isCustomSupplyCode,
    neighborSupplies,
} from '../../../catalog';

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
 * кастомная — линейная интерполяция цен соседних поставок того же типа
 * (⚠️ рабочее допущение формулы X-ОД, цена строки правится вручную).
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
    const { lower, upper } = neighborSupplies(
        catalog,
        supply.type,
        supply.usersQuantity,
    );
    const priceOf = (neighbor: KSupply | null) => {
        if (!neighbor) return null;
        const value = findProfBasePrice(
            catalog,
            complectCode,
            neighbor.code,
            scope,
        );
        return value === null
            ? null
            : { usersQuantity: neighbor.usersQuantity, value };
    };
    const interpolated = interpolateByOd(
        priceOf(lower),
        priceOf(upper),
        supply.usersQuantity,
    );
    return interpolated === null ? null : Math.round(interpolated * 100) / 100;
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
