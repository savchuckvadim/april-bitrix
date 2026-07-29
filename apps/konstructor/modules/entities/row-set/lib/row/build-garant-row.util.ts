import { resolveSupply } from '../../../catalog';
import type { Composition } from '../../../composition';
import type { KRow, RowRole } from '../../model/types';
import {
    calcPeriodPrice,
    findProfBasePriceForSupply,
    makeRowPrice,
    regionScope,
} from '../price';
import type { BuildRowCtx } from './types';

/**
 * Garant-строка по требованию (замена легаси-предгенерации матрицы
 * продуктов): PROF — цена из прайс-таблицы; universal —
 * abs × region.abs × коэффициент поставки. null = комбинации нет цены.
 */

export interface BuildGarantRowInput extends BuildRowCtx {
    key: string;
    setId: string;
    role: RowRole;
    complectCode: string;
    supplyCode: string;
    contractCode: string;
    composition?: Composition;
    /** Сохраняемое количество (пересборка сета не сбрасывает quantity) */
    quantity?: number;
}

export const buildGarantRow = (input: BuildGarantRowInput): KRow | null => {
    const { catalog } = input;
    const complect = catalog.complects.byCode[input.complectCode];
    // resolveSupply: справочник ИЛИ синтетическая X-ОД (x_<type>_<n>)
    const supply = resolveSupply(catalog, input.supplyCode);
    const contract = catalog.contracts.byCode[input.contractCode];
    const region = catalog.regions.byCode[input.regionCode];
    if (!complect || !supply || !contract || !region) return null;

    let monthBase: number | null;
    if (complect.type === 'universal') {
        monthBase =
            complect.abs !== null
                ? complect.abs * region.abs * supply.coefficient
                : null;
    } else {
        monthBase = findProfBasePriceForSupply(
            catalog,
            complect.code,
            supply,
            regionScope(region),
        );
    }
    if (monthBase === null) return null;

    const period = calcPeriodPrice({
        monthBase,
        contract,
        withTax: input.withTax,
    });

    return {
        key: input.key,
        setId: input.setId,
        role: input.role,
        productType: 'garant',
        refs: {
            complectCode: complect.code,
            supplyCode: supply.code,
            contractCode: contract.code,
        },
        composition: input.composition,
        names: {
            name: complect.fullTitle,
            shortName: complect.shortTitle,
            alternativeName: null,
        },
        price: makeRowPrice(period, contract, input.quantity ?? 1),
    };
};
