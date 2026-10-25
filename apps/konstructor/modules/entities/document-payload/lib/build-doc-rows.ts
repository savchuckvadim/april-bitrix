import { resolveSupply, type Catalog } from '../../catalog';
import { buildTotalRow, type KRow, type RowSet } from '../../row-set';
import type { DocProduct, DocRow, DocRowPrice, DocRowSet, DocRowSets } from '../model/dto';
import { complectNumberOf, contractNumberOf } from './legacy-numbers.util';
import { toDocContract, toDocSupply } from './build-doc-refs';

/**
 * Строки и сеты в легаси-форме payload (ProductRowDto / ProductRowSetDto):
 * бэк рендерит таблицы цен КП и спецификации по ним. Номера — из таблиц
 * legacy-codes (единственное место, где number живёт вне v1-адаптера).
 */

const SET_ID = { general: 0 } as const;

const toDocPrice = (row: KRow, contractNumber: number): DocRowPrice => ({
    default: row.price.base,
    current: row.price.current,
    measure: {
        id: row.price.measure.id,
        code: row.price.measure.code,
        type: row.price.measure.type,
        name: row.price.measure.name,
        contractNumber,
    },
    month: row.price.month,
    quantity: row.price.quantity,
    discount: {
        precent: row.price.discount.percent,
        amount: row.price.discount.amount,
        current: row.price.discount.current,
    },
    sum: row.price.sum,
});

const toDocProduct = (catalog: Catalog, row: KRow): DocProduct => {
    const complect = catalog.complects.byCode[row.refs.complectCode ?? ''];
    const contract = catalog.contracts.byCode[row.refs.contractCode];
    const supply = resolveSupply(catalog, row.refs.supplyCode);
    if (!contract) throw new Error(`document-payload: нет договора ${row.refs.contractCode}`);
    return {
        number: complectNumberOf(row.refs.complectCode),
        name: complect?.fullTitle ?? row.names.name,
        productId: contract.bitrixItemId,
        complectNumber: complectNumberOf(row.refs.complectCode),
        complectName: complect?.fullTitle ?? row.names.name,
        withConsalting: complect?.withConsalting ?? false,
        complectType: complect?.type ?? 'prof',
        abs: complect?.type === 'universal',
        supplyNumber: supply ? toDocSupply(catalog, supply).number : 0,
        supplyName: supply?.name ?? '',
        supplyType: supply?.type ?? '',
        quantityForKp: supply?.quantityForKp ?? '',
        contractCoefficient: contract.durationMonths,
        contract: toDocContract(contract),
        supply: supply ? toDocSupply(catalog, supply) : null,
        type: row.productType,
    };
};

/** id строки в сете: главный товар — 0 (легаси-магия `id === 0`) */
const rowIdOf = (row: KRow, index: number): number => (row.role === 'main' ? 0 : index + 1);

export const toDocRow = (
    catalog: Catalog,
    row: KRow,
    kind: 'general' | 'alternative',
    setId: number,
    index: number,
): DocRow => {
    const contract = catalog.contracts.byCode[row.refs.contractCode];
    const supply = resolveSupply(catalog, row.refs.supplyCode);
    const contractNumber = contractNumberOf(row.refs.contractCode);
    const complect = catalog.complects.byCode[row.refs.complectCode ?? ''];
    const docSupply = supply ? toDocSupply(catalog, supply) : null;
    return {
        number: index,
        name: row.names.name,
        shortName: row.names.shortName,
        alternativeName: row.names.alternativeName ?? undefined,
        type: kind,
        id: rowIdOf(row, index),
        setId,
        isUpdating: false,
        productType: row.productType,
        complect: { type: complect?.type ?? 'prof', number: complectNumberOf(row.refs.complectCode) },
        contract: { name: contract?.name ?? row.refs.contractCode, number: contractNumber },
        supply: docSupply
            ? {
                  name: docSupply.name,
                  forkp: supply?.quantityForKp ?? '',
                  number: docSupply.number,
                  type: docSupply.type,
              }
            : undefined,
        price: toDocPrice(row, contractNumber),
        product: toDocProduct(catalog, row),
        currentSupply:
            docSupply ??
            ({ number: 0, name: '', type: 'internet', coefficient: 1 } satisfies DocRow['currentSupply']),
    };
};

/** Сет с total-строкой (легаси RowSetType): строки по типам продукта. */
export const toDocRowSet = (catalog: Catalog, set: RowSet, setId: number): DocRowSet => {
    const kind = set.kind;
    const rows = set.rows.map((row, index) => toDocRow(catalog, row, kind, setId, index));
    const total = buildTotalRow(set);
    const totalRow = total ? [toDocRow(catalog, total, kind, setId, 0)] : [];
    const byType = (type: KRow['productType']) =>
        rows.filter((row, index) => set.rows[index]!.productType === type);
    return {
        id: setId,
        show: set.collapsed,
        rows: {
            garant: byType('garant'),
            lt: [...byType('lt'), ...byType('lt_other')],
            consalting: byType('consalting'),
            star: [...byType('star'), ...byType('academy')],
        },
        total: totalRow,
    };
};

export const toDocRowSets = (
    catalog: Catalog,
    general: RowSet,
    alternative: RowSet[],
): DocRowSets => ({
    general: [toDocRowSet(catalog, general, SET_ID.general)],
    alternative: alternative.map((set, index) => toDocRowSet(catalog, set, index + 1)),
});

/** Все строки документа (легаси getAllRowsFromSets): свёрнутый сет — его total */
export const toDocRows = (catalog: Catalog, general: RowSet, alternative: RowSet[]): DocRow[] => {
    const sets = [general, ...alternative];
    return sets.flatMap((set, setIndex) => {
        if (set.collapsed) {
            const total = buildTotalRow(set);
            return total ? [toDocRow(catalog, total, set.kind, setIndex, 0)] : [];
        }
        return set.rows.map((row, index) => toDocRow(catalog, row, set.kind, setIndex, index));
    });
};
