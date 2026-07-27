import type { Catalog, KService } from '../../catalog';
import { LT_PACKAGE_BY_WEIGHT } from '../../catalog';
import type { Composition } from '../../composition';
import { ltPacketWeight } from '../../composition';
import type { KRow, RowProductType, RowRole } from '../model/types';
import {
    calcPeriodPrice,
    findPackagePrice,
    findProfBasePrice,
    makeRowPrice,
    regionScope,
} from './pricing';

/**
 * Сборка строки по требованию (замена легаси-предгенерации матрицы продуктов).
 * Продукт = чистая функция от (каталог, комплект, поставка, договор, регион).
 */

export interface BuildRowCtx {
    catalog: Catalog;
    regionCode: string;
    withTax: boolean;
}

export interface BuildGarantRowInput extends BuildRowCtx {
    key: string;
    setId: string;
    role: RowRole;
    complectCode: string;
    supplyCode: string;
    contractCode: string;
    composition?: Composition;
}

export const buildGarantRow = (input: BuildGarantRowInput): KRow | null => {
    const { catalog } = input;
    const complect = catalog.complects.byCode[input.complectCode];
    const supply = catalog.supplies.byCode[input.supplyCode];
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
        monthBase = findProfBasePrice(
            catalog,
            complect.code,
            supply.code,
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
        price: makeRowPrice(period, contract),
    };
};

export interface BuildServiceRowInput extends BuildRowCtx {
    key: string;
    setId: string;
    role: RowRole;
    productType: Exclude<RowProductType, 'garant' | 'academy'>;
    service: KService;
    supplyCode: string;
    contractCode: string;
    /** СТАР бесплатен при complect.withStar / комплекте exzak */
    isFree?: boolean;
}

export const buildServiceRow = (input: BuildServiceRowInput): KRow | null => {
    const { catalog, service } = input;
    const contract = catalog.contracts.byCode[input.contractCode];
    const region = catalog.regions.byCode[input.regionCode];
    if (!contract || !region) return null;

    let monthBase: number | null = null;
    if (service.productType === 'consalting') {
        monthBase = service.abs !== null ? service.abs * region.abs : null;
    } else {
        monthBase = findPackagePrice(
            catalog,
            service.code,
            regionScope(region),
        );
    }
    if (monthBase === null) return null;

    const period = calcPeriodPrice({
        monthBase,
        contract,
        withTax: input.withTax,
    });
    const price = makeRowPrice(period, contract);

    return {
        key: input.key,
        setId: input.setId,
        role: input.role,
        productType: input.productType,
        refs: {
            supplyCode: input.supplyCode,
            contractCode: contract.code,
            serviceCode: service.code,
        },
        names: {
            name: service.fullName,
            shortName: service.shortName,
            alternativeName: null,
        },
        price: input.isFree
            ? {
                  ...price,
                  current: 0,
                  sum: 0,
                  month: 0,
                  discount: { percent: 1, amount: price.base, current: 'percent' },
              }
            : price,
        isFree: input.isFree,
    };
};

export interface BuildAcademyRowInput extends BuildRowCtx {
    key: string;
    setId: string;
    role: RowRole;
    academyCode: string;
    supplyCode: string;
    contractCode: string;
}

export const buildAcademyRow = (input: BuildAcademyRowInput): KRow | null => {
    const { catalog } = input;
    const pkg = catalog.academy.find(item => item.code === input.academyCode);
    const contract = catalog.contracts.byCode[input.contractCode];
    if (!pkg || !contract) return null;

    if (!pkg.contractLong.includes(contract.durationMonths)) return null;

    const period = calcPeriodPrice({
        monthBase: pkg.price,
        contract,
        withTax: input.withTax,
        academyMonthQuantity: pkg.monthQuantity,
    });

    return {
        key: input.key,
        setId: input.setId,
        role: input.role,
        productType: 'academy',
        refs: {
            supplyCode: input.supplyCode,
            contractCode: contract.code,
            serviceCode: pkg.code,
        },
        names: {
            name: pkg.name,
            shortName: 'Академия ГАРАНТ',
            alternativeName: null,
        },
        price: makeRowPrice(period, contract),
    };
};

/**
 * Платный LT-пакет по составу ltInPacket: пакет ищется в каталоге (БД)
 * по суммарному весу; статическая таблица — только fallback по коду.
 */
export const resolveLtPackage = (
    catalog: Catalog,
    composition: Composition,
): KService | null => {
    const weight = ltPacketWeight(composition, catalog);
    if (weight === 0) return null;
    const byWeight = catalog.services.ltPackages.find(
        pkg => pkg.weight === weight,
    );
    if (byWeight) return byWeight;
    const meta = LT_PACKAGE_BY_WEIGHT[weight];
    if (!meta) return null;
    return (
        catalog.services.ltPackages.find(pkg => pkg.code === meta.code) ?? null
    );
};
