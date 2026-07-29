import { describe, expect, it } from 'vitest';
import {
    discountDisplayValue,
    parseCommercialInput,
    quantityFieldLabel,
} from '../price';
import type { RowPrice } from '../../model/types';

const price = (over: Partial<RowPrice> = {}): RowPrice => ({
    base: 1000,
    current: 900,
    quantity: 2,
    month: 1000,
    sum: 1800,
    measure: { id: 1, code: 1, name: 'мес.', type: 1 },
    discount: { percent: 0.9, amount: 100, current: 'percent' },
    ...over,
});

describe('подписи и отображение', () => {
    it('Аванс — помесячный сервисный договор, иначе Количество', () => {
        expect(
            quantityFieldLabel({ kind: 'service', durationMonths: 1 }),
        ).toBe('Аванс');
        expect(
            quantityFieldLabel({ kind: 'abon', durationMonths: 12 }),
        ).toBe('Количество');
        expect(quantityFieldLabel({ kind: 'key', durationMonths: 1 })).toBe(
            'Количество',
        );
        expect(quantityFieldLabel(null)).toBe('Количество');
    });

    it('скидка: %-режим → (1−percent)×100, ₽-режим → amount', () => {
        expect(discountDisplayValue(price())).toBe(10);
        expect(
            discountDisplayValue(
                price({
                    discount: { percent: 0.9, amount: 100, current: 'amount' },
                }),
            ),
        ).toBe(100);
    });
});

describe('разбор ввода', () => {
    it('количество: целое в границах 0<q<100', () => {
        expect(parseCommercialInput('quantity', '5', price())).toEqual({
            kind: 'quantity',
            value: 5,
        });
        expect(parseCommercialInput('quantity', '5,6', price())).toEqual({
            kind: 'quantity',
            value: 6,
        });
        expect(parseCommercialInput('quantity', '0', price())).toBeNull();
        expect(parseCommercialInput('quantity', '100', price())).toBeNull();
    });

    it('скидка %: display → коэффициент; границы −1500<v<500', () => {
        expect(parseCommercialInput('discount', '20', price())).toEqual({
            kind: 'discountPercent',
            value: 0.8,
        });
        expect(parseCommercialInput('discount', '500', price())).toBeNull();
        expect(parseCommercialInput('discount', '-1500', price())).toBeNull();
    });

    it('скидка ₽: значение в рублях', () => {
        const rub = price({
            discount: { percent: 0.9, amount: 100, current: 'amount' },
        });
        expect(parseCommercialInput('discount', '150', rub)).toEqual({
            kind: 'discountAmount',
            value: 150,
        });
    });

    it('цена: неотрицательная, «1 234,56» парсится', () => {
        expect(parseCommercialInput('price', '1 234,56', price())).toEqual({
            kind: 'price',
            value: 1234.56,
        });
        expect(parseCommercialInput('price', '-5', price())).toBeNull();
        expect(parseCommercialInput('price', 'abc', price())).toBeNull();
    });
});
