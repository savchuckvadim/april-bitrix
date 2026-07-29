import type { Catalog } from '../../../catalog';
import { mergeCompositions } from '../../../composition';
import type { KRow, RowSet } from '../../model/types';
import {
    buildAcademyRow,
    buildGarantRow,
    buildServiceRow,
    resolveLtPackage,
} from '../row';
import { garantRows, leadGarantRow } from './set-ops.util';

export interface RowSetContext {
    regionCode: string | null;
    withTax: boolean;
}

/**
 * Пересборка сета после изменения наполнения/региона
 * (замена легаси changeCurrentProductAndPrice + setGeneralProductRows):
 * - garant-строки пересчитываются по каталогу (композиция, роль,
 *   количество и пользовательское имя сохраняются);
 * - сервисные строки (LT-пакет, консалтинг, СТАР, академия) выводятся из
 *   ОБЪЕДИНЁННОГО наполнения garant-строк сета (мердж без повторов);
 * - сервисные строки привязаны к ВЕДУЩЕЙ garant-строке (у comparison-сетов
 *   main-строки нет — поэтому не findMainRow);
 * - ручные правки коммерции и total-строки при пересборке сбрасываются —
 *   как в легаси (количество сохраняется).
 */
export const syncSetWithComposition = (
    set: RowSet,
    catalog: Catalog,
    context: RowSetContext,
): RowSet => {
    if (!context.regionCode) return set;
    const lead = leadGarantRow(set);
    if (!lead) return set;

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
            quantity: row.price.quantity,
        });
        if (rebuilt) {
            rebuiltGarant.push({
                ...rebuilt,
                names: {
                    ...rebuilt.names,
                    alternativeName: row.names.alternativeName,
                },
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
    const leadComplect = lead.refs.complectCode
        ? catalog.complects.byCode[lead.refs.complectCode]
        : null;
    const serviceBase = {
        catalog,
        regionCode: context.regionCode,
        withTax: context.withTax,
        setId: set.id,
        role: lead.role,
        supplyCode: lead.refs.supplyCode,
        contractCode: lead.refs.contractCode,
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
                        Boolean(leadComplect?.withServices) &&
                        leadComplect?.code === 'exzak',
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
                role: lead.role,
                academyCode: merged.academy,
                supplyCode: lead.refs.supplyCode,
                contractCode: lead.refs.contractCode,
            });
            if (row) serviceRows.push(row);
        }
    }

    return {
        ...set,
        rows: [...rebuiltGarant, ...serviceRows],
        totalPrice: null,
    };
};
