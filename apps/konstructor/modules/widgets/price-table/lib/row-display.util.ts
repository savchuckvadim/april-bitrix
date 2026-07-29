import { resolveSupply, type Catalog } from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';

/**
 * Отображаемое имя строки: пользовательское (alternativeName) побеждает;
 * дефолт garant-строки — «Комплект + Вид поставки» (легаси-формат).
 * resolveSupply — справочник или синтетическая X-ОД.
 */
export const getRowDisplayName = (row: KRow, catalog: Catalog): string => {
    if (row.names.alternativeName) return row.names.alternativeName;
    if (row.productType !== 'garant') return row.names.name;
    const supply = resolveSupply(catalog, row.refs.supplyCode);
    return supply ? `${row.names.name} ${supply.name}` : row.names.name;
};

/** Подпись рефов сервисной строки: «Вид поставки • Договор» */
export const getServiceRefsLabel = (row: KRow, catalog: Catalog): string => {
    const supply = resolveSupply(catalog, row.refs.supplyCode);
    const contract = catalog.contracts.byCode[row.refs.contractCode];
    return [supply?.name, contract?.name].filter(Boolean).join(' • ');
};
