import type { KService } from '../../../catalog';
import type { KRow, RowProductType, RowRole } from '../../model/types';
import {
    calcPeriodPrice,
    findPackagePrice,
    makeRowPrice,
    regionScope,
} from '../price';
import type { BuildRowCtx } from './types';

/**
 * Сервисная строка (LT-пакет, консалтинг, СТАР): консалтинг —
 * abs × region.abs; пакеты — цена из прайса по packageCode.
 * isFree (СТАР при withStar) — обнуление продажной цены.
 */

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
