import type { Catalog } from '../../../catalog';
import type { KRow, RowSet } from '../../model/types';
import { buildAcademyRow } from '../row';
import { garantRows, leadGarantRow, removeByProductType, replaceServiceRow } from './set-ops.util';
import type { RowSetContext } from './sync-set.util';

/**
 * Строка академии набора: выбранный пакет из наполнений Гарантов (первый
 * непустой), срок — количество ведущей строки × договор. Пакет не подходит
 * под срок — строки нет, выбор в наполнении остаётся.
 */
export const academyRowFor = (
    set: RowSet,
    catalog: Catalog,
    context: RowSetContext,
): KRow | null => {
    const lead = leadGarantRow(set);
    const academyCode =
        garantRows(set)
            .map(row => row.composition?.academy ?? null)
            .find(code => code !== null) ?? null;
    if (!lead || !academyCode || !context.regionCode) return null;
    const previous = set.rows.find(row => row.productType === 'academy');
    return buildAcademyRow({
        catalog,
        regionCode: context.regionCode,
        withTax: context.withTax,
        key: `${set.id}_academy`,
        setId: set.id,
        role: lead.role,
        academyCode,
        supplyCode: lead.refs.supplyCode,
        contractCode: lead.refs.contractCode,
        quantity: lead.price.quantity,
        ownQuantity: previous?.quantityLocked ? previous.price.quantity : undefined,
    });
};

const sameAcademyRow = (a: KRow, b: KRow): boolean =>
    a.refs.serviceCode === b.refs.serviceCode &&
    a.price.base === b.price.base &&
    a.price.quantity === b.price.quantity;

/**
 * Пересобрать только строку академии (смена количества меняет срок сделки):
 * остальные строки и ручные правки цен остаются как есть. Тот же набор, если
 * менять нечего.
 */
export const syncAcademyRow = (set: RowSet, catalog: Catalog, context: RowSetContext): RowSet => {
    const previous = set.rows.find(row => row.productType === 'academy') ?? null;
    const next = academyRowFor(set, catalog, context);
    if (!previous && !next) return set;
    if (!next) return removeByProductType(set, 'academy');
    if (previous && sameAcademyRow(previous, next)) return set;
    return replaceServiceRow(set, next);
};
