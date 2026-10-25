import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { buildGarantRow } from '../row';
import {
    applyCommercialEdit,
    applyTaxChange,
    discountDisplayValue,
    parseCommercialInput,
    quantityFieldLabel,
} from '../price';

/**
 * Границы правок коммерции — паритет с легаси row-price-utils
 * (calculateTotalPrice / transformToNumber / changeDisplayCommercial):
 * QUANTITY 0 < q < 100 (целое), DISCOUNT в %/₽ с границами ввода,
 * SUM с гардом −50 < (sum/q)/base < 50, DEFAULT ±5 % налога.
 */
const catalog = catalogFromOldInit(oldInit);
const row = buildGarantRow({
    catalog,
    regionCode: 'stv',
    withTax: false,
    key: 'row1',
    setId: 'general',
    role: 'main',
    complectCode: 'buh',
    supplyCode: 'internet_1',
    contractCode: 'abonYear',
})!;

describe('parseCommercialInput: границы ввода', () => {
    it('количество — целое в (0, 100); дробь округляется, края отклоняются', () => {
        expect(parseCommercialInput('quantity', '2,6', row.price)).toEqual({
            kind: 'quantity',
            value: 3,
        });
        expect(parseCommercialInput('quantity', '0', row.price)).toBeNull();
        expect(parseCommercialInput('quantity', '100', row.price)).toBeNull();
        expect(parseCommercialInput('quantity', '99', row.price)).toEqual({
            kind: 'quantity',
            value: 99,
        });
    });

    it('цена — не отрицательная; пробелы и запятая допустимы', () => {
        expect(parseCommercialInput('price', '12 345,5', row.price)).toEqual({
            kind: 'price',
            value: 12345.5,
        });
        expect(parseCommercialInput('price', '-1', row.price)).toBeNull();
        expect(parseCommercialInput('price', 'abc', row.price)).toBeNull();
    });

    it('скидка: % → коэффициент (1 − v/100), ₽ → сумма; границы −1500 < v < 500', () => {
        expect(parseCommercialInput('discount', '20', row.price)).toEqual({
            kind: 'discountPercent',
            value: 0.8,
        });
        const amountMode = {
            ...row.price,
            discount: { ...row.price.discount, current: 'amount' as const },
        };
        expect(parseCommercialInput('discount', '300', amountMode)).toEqual({
            kind: 'discountAmount',
            value: 300,
        });
        // границы ввода общие для обоих режимов
        expect(parseCommercialInput('discount', '1000', amountMode)).toBeNull();
        expect(parseCommercialInput('discount', '500', row.price)).toBeNull();
        expect(parseCommercialInput('discount', '-1500', row.price)).toBeNull();
    });
});

describe('applyCommercialEdit: границы применения', () => {
    it('сумма: гард −50 < (sum/q)/base < 50 и month = current после правки суммы', () => {
        const ok = applyCommercialEdit(row.price, { kind: 'sum', value: 50000 });
        expect(ok.current).toBe(50000);
        expect(ok.month).toBe(ok.current);
        const tooBig = applyCommercialEdit(row.price, {
            kind: 'sum',
            value: row.price.base * 60,
        });
        expect(tooBig).toBe(row.price);
    });

    it('скидка в %: current = base × percent, amount = base − current', () => {
        const edited = applyCommercialEdit(row.price, {
            kind: 'discountPercent',
            value: 0.9,
        });
        expect(edited.current).toBe(Number((row.price.base * 0.9).toFixed(2)));
        expect(edited.discount.amount).toBe(
            Number((row.price.base - edited.current).toFixed(2)),
        );
        expect(edited.discount.current).toBe('percent');
    });

    it('налог поставщика (DEFAULT ±5 %): туда и обратно без дрейфа', () => {
        const contract = catalog.contracts.byCode['abonYear']!;
        const taxed = applyTaxChange(row.price, contract, false, true);
        expect(taxed.base).toBe(Number((row.price.base * 1.05).toFixed(2)));
        const back = applyTaxChange(taxed, contract, true, false);
        expect(back.base).toBeCloseTo(row.price.base, 1);
        // процентная скидка сохраняется при смене налога
        expect(back.discount.percent).toBe(row.price.discount.percent);
    });
});

describe('подписи полей', () => {
    it('«Аванс» только у помесячного сервисного договора', () => {
        expect(quantityFieldLabel(catalog.contracts.byCode['internet']!)).toBe('Аванс');
        expect(quantityFieldLabel(catalog.contracts.byCode['abonYear']!)).toBe('Количество');
        expect(quantityFieldLabel(null)).toBe('Количество');
    });

    it('отображение скидки: % как (1 − percent)·100, ₽ как amount', () => {
        expect(discountDisplayValue(row.price)).toBe(20); // abonYear: 0.8
        expect(
            discountDisplayValue({
                ...row.price,
                discount: { percent: 1, amount: 777, current: 'amount' },
            }),
        ).toBe(777);
    });
});
