import type { Catalog } from '../../catalog';
import { mergeCompositions } from '../../composition';
import type { KRow, RowSet } from '../model/types';
import {
    buildAcademyRow,
    buildGarantRow,
    buildServiceRow,
    resolveLtPackage,
} from './build-row';
import { findMainRow, garantRows } from './row-set';

export interface RowSetContext {
    regionCode: string | null;
    withTax: boolean;
}

/**
 * Пересборка сета после изменения наполнения/региона/налога
 * (замена легаси changeCurrentProductAndPrice + setGeneralProductRows):
 * - garant-строки пересчитываются по каталогу (композиция и роль сохраняются);
 * - сервисные строки (LT-пакет, консалтинг, СТАР, академия) выводятся из
 *   ОБЪЕДИНЁННОГО наполнения garant-строк сета (мердж без повторов).
 * Ручные правки коммерции при пересборке сбрасываются — как в легаси
 * (количество сохраняется).
 */
export const syncSetWithComposition = (
    set: RowSet,
    catalog: Catalog,
    context: RowSetContext,
): RowSet => {
    if (!context.regionCode) return set;
    const main = findMainRow(set);
    if (!main) return set;

    const rebuiltGarant: KRow[] = [];
    for (const row of garantRows(set)) {
        const rebuilt = buildGarantRow({
            catalog,
            regionCode: context.regionCode,
            withTax: context.withTax,
            key: row.key,
            setId: row.setId,
            role: row.role,
            complectCode: row.refs.complectCode ?? '',
            supplyCode: row.refs.supplyCode,
            contractCode: row.refs.contractCode,
            composition: row.composition,
        });
        if (rebuilt) {
            rebuiltGarant.push({
                ...rebuilt,
                price: { ...rebuilt.price, quantity: row.price.quantity },
            });
        } else {
            rebuiltGarant.push(row);
        }
    }

    const merged = mergeCompositions(
        rebuiltGarant
            .map(row => row.composition)
            .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    );

    const serviceRows: KRow[] = [];
    const mainComplect = main.refs.complectCode
        ? catalog.complects.byCode[main.refs.complectCode]
        : null;
    const serviceBase = {
        catalog,
        regionCode: context.regionCode,
        withTax: context.withTax,
        setId: set.id,
        role: main.role,
        supplyCode: main.refs.supplyCode,
        contractCode: main.refs.contractCode,
    } as const;

    if (merged) {
        const ltPackage = resolveLtPackage(catalog, merged);
        if (ltPackage) {
            const row = buildServiceRow({
                ...serviceBase,
                key: `${set.id}_lt`,
                productType: 'lt',
                service: ltPackage,
            });
            if (row) serviceRows.push(row);
        }

        if (merged.consalting) {
            const service = catalog.services.consalting.find(
                item => item.code === merged.consalting,
            );
            if (service) {
                const row = buildServiceRow({
                    ...serviceBase,
                    key: `${set.id}_consalting`,
                    productType: 'consalting',
                    service,
                });
                if (row) serviceRows.push(row);
            }
        }

        if (merged.star) {
            const service = catalog.services.star[0];
            if (service) {
                const row = buildServiceRow({
                    ...serviceBase,
                    key: `${set.id}_star`,
                    productType: 'star',
                    service,
                    isFree:
                        Boolean(mainComplect?.withServices) &&
                        mainComplect?.code === 'exzak',
                });
                if (row) serviceRows.push(row);
            }
        }

        if (merged.academy) {
            const row = buildAcademyRow({
                catalog,
                regionCode: context.regionCode,
                withTax: context.withTax,
                key: `${set.id}_academy`,
                setId: set.id,
                role: main.role,
                academyCode: merged.academy,
                supplyCode: main.refs.supplyCode,
                contractCode: main.refs.contractCode,
            });
            if (row) serviceRows.push(row);
        }
    }

    return { ...set, rows: [...rebuiltGarant, ...serviceRows] };
};
