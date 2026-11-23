import { describe, expect, it } from 'vitest';
import type { BitrixProductRow } from '../../../row-set';
import {
    VARIANT_ROW_CUSTOMIZED,
    VARIANT_ROW_DISCOUNT_TYPE_ID,
    buildVariantProductRowsRequest,
    toVariantProductRow,
} from '../variant-product-rows';

/**
 * Строки элемента смарта варианта: тот же формат, что бэк пишет в сделку
 * (deal-field-resolver, resolveProductRows), и владелец — код `T…` смарта.
 */

const fullRow: BitrixProductRow = {
    productId: 4210,
    productName: 'Гарант Бухгалтер Интернет 5 ОД',
    price: 8000,
    quantity: 12,
    measureCode: 9,
    measureId: 3,
    supply: 'Интернет 5 ОД',
    priceNetto: 10000,
    discountSum: 2000,
    sort: 4,
};

describe('toVariantProductRow', () => {
    it('поля строки набора и константы Битрикса: скидка суммой, цена задана вручную', () => {
        expect(toVariantProductRow(fullRow, 0)).toEqual({
            productName: 'Гарант Бухгалтер Интернет 5 ОД',
            price: 8000,
            quantity: 12,
            priceNetto: 10000,
            discountSum: 2000,
            discountTypeId: 1,
            customized: 'Y',
            supply: 'Интернет 5 ОД',
            measureCode: '9',
            measureId: 3,
            sort: 4,
        });
        expect(VARIANT_ROW_DISCOUNT_TYPE_ID).toBe(1);
        expect(VARIANT_ROW_CUSTOMIZED).toBe('Y');
    });

    it('productId договора в строку не идёт: набор заменяется целиком, как у бэка', () => {
        expect(toVariantProductRow(fullRow, 0)).not.toHaveProperty('productId');
        expect(toVariantProductRow(fullRow, 0)).not.toHaveProperty('id');
    });

    it('единица измерения без внутреннего id: measureId повторяет код единицы', () => {
        const row = toVariantProductRow({ ...fullRow, measureId: undefined }, 0);

        expect(row.measureCode).toBe('9');
        expect(row.measureId).toBe('9');
    });

    it('единицы нет: ни кода, ни id', () => {
        const row = toVariantProductRow({ ...fullRow, measureCode: undefined, measureId: undefined }, 0);

        expect(row.measureCode).toBeUndefined();
        expect(row.measureId).toBeUndefined();
    });

    it('цена до скидки и скидка не заданы: priceNetto равна цене, скидка нулевая', () => {
        const row = toVariantProductRow(
            { productName: 'Строка', price: 500, quantity: 1, priceNetto: undefined, discountSum: undefined },
            0,
        );

        expect(row.priceNetto).toBe(500);
        expect(row.discountSum).toBe(0);
    });

    it('номер сортировки не задан: берётся позиция строки', () => {
        expect(toVariantProductRow({ productName: 'Строка', price: 1, quantity: 1 }, 7).sort).toBe(7);
    });
});

describe('buildVariantProductRowsRequest', () => {
    it('владелец — код T… по id типа смарта, id владельца — элемент варианта', () => {
        const request = buildVariantProductRowsRequest(1038, 77, [fullRow]);

        expect(request.ownerType).toBe('T40e');
        expect(request.ownerId).toBe(77);
        expect(request.productRows).toHaveLength(1);
    });

    it('строки идут в порядке набора', () => {
        const rows: BitrixProductRow[] = [
            { productName: 'Первая', price: 1, quantity: 1, sort: 0 },
            { productName: 'Вторая', price: 2, quantity: 1, sort: 1 },
        ];

        const request = buildVariantProductRowsRequest(140, 5, rows);

        expect(request.productRows.map(row => row.productName)).toEqual(['Первая', 'Вторая']);
        expect(request.productRows.map(row => row.sort)).toEqual([0, 1]);
    });

    it('пустой набор: запрос с пустым списком строк очищает строки элемента', () => {
        expect(buildVariantProductRowsRequest(140, 5, [])).toEqual({
            ownerType: 'T8c',
            ownerId: 5,
            productRows: [],
        });
    });

    it('id типа смарта не годится: запрос не строится', () => {
        expect(() => buildVariantProductRowsRequest(0, 5, [])).toThrow(RangeError);
    });
});
