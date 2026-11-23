import type {
    IBXProductRow,
    IBXProductRowRow,
} from '@bitrix/domain/crm/product-row/interface/bx-product-row.interface';
import { buildSmartOwnerType } from '@bitrix/domain/crm/product-row/lib/smart-owner-type.util';
// тип без рантайм-импорта: баррель row-set тянет слушатели стора
import type { BitrixProductRow } from '../../row-set';

/**
 * Товарные строки элемента смарта «Вариант комплекта». Формат повторяет
 * строки, которые бэк пишет в сделку и в элемент смарта (deal-field-resolver,
 * resolveProductRows): без `id` и `productId` (набор заменяется целиком,
 * строки создаются заново), с константами Битрикса и кодом единицы,
 * продублированным в `measureId`.
 */

/** Скидка задана абсолютной суммой на единицу (в Битриксе 1 — сумма, 2 — проценты). */
export const VARIANT_ROW_DISCOUNT_TYPE_ID = 1;

/** Цена строки задана вручную: Битрикс не пересчитывает её по каталогу. */
export const VARIANT_ROW_CUSTOMIZED = 'Y';

/**
 * Строка набора (BitrixProductRow из buildProductRows: имя, цены, количество,
 * единица, вид поставки) → строка `crm.item.productrow.set`. Логика цен остаётся
 * в buildProductRows, здесь добавляются только константы и формат Битрикса.
 */
export const toVariantProductRow = (row: BitrixProductRow, index: number): IBXProductRowRow => {
    const measureCode = row.measureCode === undefined ? undefined : String(row.measureCode);
    return {
        productName: row.productName,
        price: row.price,
        quantity: row.quantity,
        priceNetto: row.priceNetto ?? row.price,
        discountSum: row.discountSum ?? 0,
        discountTypeId: VARIANT_ROW_DISCOUNT_TYPE_ID,
        customized: VARIANT_ROW_CUSTOMIZED,
        supply: row.supply,
        measureCode,
        measureId: row.measureId ?? measureCode,
        sort: row.sort ?? index,
    };
};

/**
 * Запрос `crm.item.productrow.set` для элемента смарта варианта: владелец —
 * код `T…` по id типа смарта, id владельца — id элемента. Запрос заменяет все
 * строки элемента, поэтому повторная запись того же набора безопасна.
 */
export const buildVariantProductRowsRequest = (
    entityTypeId: number,
    variantSmartId: number,
    rows: readonly BitrixProductRow[],
): IBXProductRow => ({
    ownerType: buildSmartOwnerType(entityTypeId),
    ownerId: variantSmartId,
    productRows: rows.map(toVariantProductRow),
});
