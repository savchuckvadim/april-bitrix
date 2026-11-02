import { describe, expect, it } from 'vitest';
import {
    DEFAULT_RENEWAL_OFFER,
    calcAiPrice,
    calcExtrasMonthly,
    calcExtrasOnce,
    calcHeadcountRange,
    calcMonthlyTotal,
    formatEmployees,
    formatHours,
    formatRub,
    type RenewalOffer,
} from './renewal-offer.model';

const base: RenewalOffer = {
    ...DEFAULT_RENEWAL_OFFER,
    clientName: 'ООО Ромашка',
    salesPrice: 6500,
};

describe('calcAiPrice', () => {
    it('базовая цена покрывает сотрудников из базы', () => {
        expect(calcAiPrice(base)).toBe(7500);
    });

    it('каждый сверх базовых добавляет доплату', () => {
        expect(calcAiPrice({ ...base, aiEmployees: 4 })).toBe(8500);
        expect(calcAiPrice({ ...base, aiEmployees: 7 })).toBe(11500);
    });

    it('меньше базового числа цену не снижает', () => {
        expect(calcAiPrice({ ...base, aiEmployees: 1 })).toBe(7500);
    });

    it('считает по ценам клиента, а не по прайсу', () => {
        const custom: RenewalOffer = {
            ...base,
            aiBasePrice: 6000,
            aiBaseEmployees: 5,
            aiExtraPrice: 800,
            aiEmployees: 8,
        };
        expect(calcAiPrice(custom)).toBe(6000 + 3 * 800);
    });
});

describe('calcHeadcountRange', () => {
    it('коридор — плюс-минус заданная дельта', () => {
        expect(calcHeadcountRange({ ...base, aiEmployees: 5 })).toEqual({
            from: 3,
            to: 7,
        });
    });

    it('не уходит ниже одного человека', () => {
        expect(calcHeadcountRange({ ...base, aiEmployees: 2 })).toEqual({
            from: 1,
            to: 4,
        });
    });

    it('учитывает свою дельту клиента', () => {
        expect(
            calcHeadcountRange({ ...base, aiEmployees: 10, aiFreeDelta: 5 }),
        ).toEqual({ from: 5, to: 15 });
    });
});

describe('calcMonthlyTotal', () => {
    it('складывает включённые услуги', () => {
        expect(calcMonthlyTotal(base)).toBe(6500 + 7500);
    });

    it('учитывает персонального менеджера по его цене', () => {
        expect(
            calcMonthlyTotal({
                ...base,
                managerIncluded: true,
                managerPrice: 8000,
            }),
        ).toBe(6500 + 7500 + 8000);
    });

    it('исключённые услуги не считает', () => {
        expect(
            calcMonthlyTotal({
                ...base,
                salesIncluded: false,
                aiIncluded: false,
            }),
        ).toBe(0);
    });

    it('вычитает скидку', () => {
        expect(calcMonthlyTotal({ ...base, adjustment: -2000 })).toBe(
            6500 + 7500 - 2000,
        );
    });

    it('скидка больше суммы не уводит итог в минус', () => {
        expect(calcMonthlyTotal({ ...base, adjustment: -999999 })).toBe(0);
    });

    it('добавляет помесячные дополнительные строки', () => {
        const withExtras: RenewalOffer = {
            ...base,
            extras: [
                { title: 'Телефония', price: 3000, period: 'month' },
                { title: 'Обучение', price: 15000, period: 'once' },
            ],
        };
        expect(calcMonthlyTotal(withExtras)).toBe(6500 + 7500 + 3000);
    });

    it('разовые строки в месячный итог не входят', () => {
        const withOnce: RenewalOffer = {
            ...base,
            extras: [{ title: 'Внедрение', price: 50000, period: 'once' }],
        };
        expect(calcMonthlyTotal(withOnce)).toBe(6500 + 7500);
        expect(calcExtrasOnce(withOnce)).toBe(50000);
        expect(calcExtrasMonthly(withOnce)).toBe(0);
    });
});

describe('formatRub', () => {
    it('разделяет тысячи неразрывным пробелом', () => {
        expect(formatRub(7500)).toBe('7 500 ₽');
        expect(formatRub(500)).toBe('500 ₽');
    });

    it('показывает минус у скидки', () => {
        expect(formatRub(-2000)).toBe('−2 000 ₽');
    });
});

describe('formatEmployees', () => {
    it('согласует слово с числом', () => {
        expect(formatEmployees(1)).toBe('1 сотрудник');
        expect(formatEmployees(3)).toBe('3 сотрудника');
        expect(formatEmployees(5)).toBe('5 сотрудников');
        expect(formatEmployees(11)).toBe('11 сотрудников');
        expect(formatEmployees(21)).toBe('21 сотрудник');
    });
});

describe('formatHours', () => {
    it('согласует слово с числом', () => {
        expect(formatHours(1)).toBe('1 час');
        expect(formatHours(2)).toBe('2 часа');
        expect(formatHours(30)).toBe('30 часов');
        expect(formatHours(11)).toBe('11 часов');
    });
});
