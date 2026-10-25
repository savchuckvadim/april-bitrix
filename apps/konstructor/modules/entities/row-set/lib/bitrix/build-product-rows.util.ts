import { resolveSupply, type Catalog } from '../../../catalog';
import type { KRow, RowSet } from '../../model/types';
import { round2 } from '../round.util';
import { buildTotalRow } from '../set/total-row.util';

/**
 * Товарная строка сделки Bitrix (crm.item.productrow) — форма 1:1 с
 * DealSendProductRowDto бэка konstructor (modules/deal-send). Константы
 * Bitrix (`customized: 'Y'`, `discountTypeId: 1`) ставит бэк при записи.
 */
export interface BitrixProductRow {
    /** ID товара каталога Bitrix — bitrixItemId договора (решение владельца 4) */
    productId?: number;
    productName: string;
    /** Цена за единицу со скидкой */
    price: number;
    quantity: number;
    /** «Код» единицы измерения в Bitrix портала (portal_measure.bitrixId) */
    measureCode?: number;
    measureId?: number;
    /** Вид поставки — для текста строки и отчётов */
    supply?: string;
    /** Цена до скидки */
    priceNetto?: number;
    /** Скидка на единицу (priceNetto − price) */
    discountSum?: number;
    sort?: number;
}

/**
 * Строка → товарная строка сделки (легаси build-deal-send-request):
 * имя = имя + вид поставки, priceNetto = base, price = current,
 * discountSum = base − current, measureCode = код единицы Bitrix.
 */
export const toBitrixProductRow = (
    row: KRow,
    catalog: Catalog,
    sort: number,
): BitrixProductRow => {
    const supply = resolveSupply(catalog, row.refs.supplyCode);
    const contract = catalog.contracts.byCode[row.refs.contractCode];
    const priceNetto = round2(row.price.base);
    const price = round2(row.price.current);
    return {
        productId: contract?.bitrixItemId || undefined,
        productName: [row.names.name, supply?.name].filter(Boolean).join(' '),
        price,
        quantity: row.price.quantity,
        measureCode: row.price.measure.code || undefined,
        measureId: row.price.measure.id || undefined,
        supply: supply?.name,
        priceNetto,
        discountSum: round2(priceNetto - price),
        sort,
    };
};

/**
 * Товарные строки сделки из general-сета: только general (альтернативы в
 * сделку не уходят); свёрнутый сет — одна total-строка, развёрнутый — все.
 */
export const buildProductRows = (
    general: RowSet,
    catalog: Catalog,
): BitrixProductRow[] => {
    if (general.collapsed) {
        const total = buildTotalRow(general);
        return total ? [toBitrixProductRow(total, catalog, 0)] : [];
    }
    return general.rows.map((row, index) => toBitrixProductRow(row, catalog, index));
};
