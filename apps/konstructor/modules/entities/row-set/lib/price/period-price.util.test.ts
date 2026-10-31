import { describe, expect, it } from 'vitest';
import type { KContract } from '../../../catalog';
import { calcPeriodPrice } from './period-price.util';

const contract = (durationMonths: number): KContract =>
    ({
        code: 'licTwoYears',
        kind: 'lic',
        name: 'Лицензионный 2 года',
        shortName: 'мес.',
        durationMonths,
        discount: 1,
        bitrixItemId: 1,
        measure: { id: 1, code: 39, name: 'Месяц', shortName: 'мес.', fullName: 'Месяц' },
        order: 1,
    }) as KContract;

describe('цена за период договора', () => {
    it('считает месячную цену делением на срок', () => {
        const price = calcPeriodPrice({
            monthBase: 1000,
            contract: contract(24),
            withTax: false,
        });
        expect(price.month).toBe(1000);
        expect(price.base).toBe(24000);
    });

    it('нулевой срок не даёт NaN', () => {
        // Регресс: prepayment терялся при сборке init (связь читалась под
        // неверным именем) и приходил нулём — base/0 давало NaN, которое
        // текло в сумму строки и в документы.
        const price = calcPeriodPrice({
            monthBase: 1000,
            contract: contract(0),
            withTax: false,
        });
        expect(Number.isNaN(price.month)).toBe(false);
        expect(price.month).toBe(0);
    });
});
