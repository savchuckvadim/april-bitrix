import { describe, expect, it } from 'vitest';
import { RENEWAL_PRICE_DEFAULTS } from '../consts/renewal-link.consts';
import {
    calcAiPrice,
    calcMonthlyTotal,
    calcOnceTotal,
    fieldsToCreateDto,
    num,
    type RenewalOfferFormFields,
} from '../ui/renewal-link-create-dialog/hooks/use-renewal-offer-form';

const d = RENEWAL_PRICE_DEFAULTS;

const fields = (
    patch: Partial<RenewalOfferFormFields> = {},
): RenewalOfferFormFields => ({
    clientName: 'ООО Ромашка',
    title: '',
    period: '60',
    salesIncluded: true,
    salesPrice: String(d.sales),
    aiIncluded: true,
    aiEmployees: String(d.aiBaseEmployees),
    aiBasePrice: String(d.aiBase),
    aiBaseEmployees: String(d.aiBaseEmployees),
    aiExtraPrice: String(d.aiExtra),
    aiFreeDelta: String(d.aiFreeDelta),
    managerIncluded: false,
    managerPrice: String(d.manager),
    devIncluded: true,
    devHours: String(d.devHours),
    devHourPrice: String(d.devHour),
    adjustment: '0',
    adjustmentLabel: 'Скидка',
    extras: [],
    ...patch,
});

describe('num: пустое поле — не ноль', () => {
    it('пустая строка даёт цену из прайса', () => {
        // Иначе стёртое поле уехало бы на бэк нулевой ценой.
        expect(num('', 5000)).toBe(5000);
    });

    it('один минус в начале ввода — ещё не число', () => {
        expect(num('-', 5000)).toBe(5000);
    });

    it('мусор даёт цену из прайса', () => {
        expect(num('дорого', 5000)).toBe(5000);
    });

    it('ноль — это ноль, а не «не ввели»', () => {
        expect(num('0', 5000)).toBe(0);
    });

    it('пробелы и запятая разбираются', () => {
        expect(num('6 500', 0)).toBe(6500);
        expect(num('6500,4', 0)).toBe(6500);
    });

    it('отрицательное значение сохраняется: это скидка', () => {
        expect(num('-2000', 0)).toBe(-2000);
    });
});

describe('calcAiPrice', () => {
    it('базовый состав стоит базовую цену', () => {
        expect(calcAiPrice(fields())).toBe(7500);
    });

    it('каждый сверх базовых добавляет доплату', () => {
        expect(calcAiPrice(fields({ aiEmployees: '7' }))).toBe(11_500);
    });

    it('меньше базовых не снижает цену', () => {
        expect(calcAiPrice(fields({ aiEmployees: '1' }))).toBe(7500);
    });
});

describe('calcMonthlyTotal', () => {
    it('складывает включённые услуги', () => {
        expect(
            calcMonthlyTotal(
                fields({ salesPrice: '6500', managerIncluded: true }),
            ),
        ).toBe(24_000);
    });

    it('выключенная услуга в сумму не входит', () => {
        expect(
            calcMonthlyTotal(fields({ salesIncluded: false })),
        ).toBe(7500);
    });

    it('скидка уменьшает сумму', () => {
        expect(calcMonthlyTotal(fields({ adjustment: '-2000' }))).toBe(10_500);
    });

    it('скидка больше суммы не делает платёж отрицательным', () => {
        expect(
            calcMonthlyTotal(
                fields({ aiIncluded: false, adjustment: '-99000' }),
            ),
        ).toBe(0);
    });

    it('месячная услуга входит в сумму, разовая — нет', () => {
        const withExtras = fields({
            extras: [
                { title: 'Телефония', price: 3000, period: 'month' },
                { title: 'Обучение', price: 15000, period: 'once' },
            ],
        });
        expect(calcMonthlyTotal(withExtras)).toBe(15_500);
        expect(calcOnceTotal(withExtras)).toBe(15_000);
    });

    it('услуга без названия в сумму не входит', () => {
        expect(
            calcMonthlyTotal(
                fields({ extras: [{ title: '  ', price: 999, period: 'month' }] }),
            ),
        ).toBe(12_500);
    });
});

describe('fieldsToCreateDto', () => {
    it('переносит цены и состав', () => {
        const dto = fieldsToCreateDto(
            fields({ salesPrice: '6500', aiEmployees: '7', managerIncluded: true }),
        );
        expect(dto.offer.salesPrice).toBe(6500);
        expect(dto.offer.aiEmployees).toBe(7);
        expect(dto.offer.managerIncluded).toBe(true);
    });

    it('«до отзыва» уходит без срока', () => {
        const dto = fieldsToCreateDto(fields({ period: 'until-revoked' }));
        expect(dto.expiresInDays).toBeUndefined();
        expect('expiresInDays' in dto).toBe(false);
    });

    it('выбранный срок уходит днями', () => {
        expect(fieldsToCreateDto(fields({ period: '90' })).expiresInDays).toBe(
            90,
        );
    });

    it('пустая пометка не отправляется', () => {
        expect('title' in fieldsToCreateDto(fields({ title: '   ' }))).toBe(
            false,
        );
    });

    it('название клиента обрезается от пробелов', () => {
        const dto = fieldsToCreateDto(fields({ clientName: '  ООО Ромашка ' }));
        expect(dto.offer.clientName).toBe('ООО Ромашка');
    });

    it('услуги без названия на бэк не отправляются', () => {
        const dto = fieldsToCreateDto(
            fields({
                extras: [
                    { title: '  ', price: 100, period: 'month' },
                    { title: ' Телефония ', price: 3000, period: 'month' },
                ],
            }),
        );
        expect(dto.offer.extras).toEqual([
            { title: 'Телефония', price: 3000, period: 'month' },
        ]);
    });

    it('пустая подпись скидки заменяется словом «Скидка»', () => {
        const dto = fieldsToCreateDto(fields({ adjustmentLabel: '  ' }));
        expect(dto.offer.adjustmentLabel).toBe('Скидка');
    });

    it('стёртая цена уходит прайсовой, а не нулевой', () => {
        const dto = fieldsToCreateDto(fields({ salesPrice: '' }));
        expect(dto.offer.salesPrice).toBe(d.sales);
    });
});
