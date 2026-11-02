import { describe, expect, it } from 'vitest';
import { buildRenewalPriceTable } from './renewal-offer.rows';
import {
    DEFAULT_RENEWAL_OFFER,
    formatRub,
    type RenewalOffer,
} from './renewal-offer.model';

const offer = (patch: Partial<RenewalOffer> = {}): RenewalOffer => ({
    ...DEFAULT_RENEWAL_OFFER,
    ...patch,
});

describe('buildRenewalPriceTable: состав таблицы', () => {
    it('по умолчанию это приложения, AI-сервис и часы разработки', () => {
        const rows = buildRenewalPriceTable(offer());
        expect(rows.monthly.map((row) => row.title)).toEqual([
            'Приложения по продажам',
            'AI-сервис — 3 сотрудника',
            'Разработка — 30 часов в месяц',
        ]);
    });

    it('часы разработки входят в пакет и сумму не меняют', () => {
        const rows = buildRenewalPriceTable(offer());
        const dev = rows.monthly.find((row) => row.included);
        expect(dev?.price).toBe('входит');
        expect(dev?.note).toContain(formatRub(2000));
        // 5000 + 7500, без разработки
        expect(rows.monthlyTotal).toBe(formatRub(12_500));
    });

    it('без часов в пакете строки разработки нет', () => {
        const rows = buildRenewalPriceTable(offer({ devHours: 0 }));
        expect(rows.monthly.some((row) => row.included)).toBe(false);
    });

    it('выключенная разработка в таблицу не попадает', () => {
        const rows = buildRenewalPriceTable(offer({ devIncluded: false }));
        expect(rows.monthly.some((row) => row.included)).toBe(false);
    });

    it('выключенная услуга в таблицу не попадает', () => {
        const rows = buildRenewalPriceTable(
            offer({
                salesIncluded: false,
                aiIncluded: false,
                devIncluded: false,
            }),
        );
        expect(rows.monthly).toHaveLength(0);
        expect(rows.monthlyTotal).toBe('0 ₽');
    });

    it('персональный менеджер печатается своей ценой', () => {
        const rows = buildRenewalPriceTable(
            offer({ managerIncluded: true, managerPrice: 8500 }),
        );
        const manager = rows.monthly.find(
            (row) => row.title === 'Персональный менеджер',
        );
        expect(manager?.price).toBe('8 500 ₽');
    });

    it('цена AI-сервиса считается по числу сотрудников', () => {
        const rows = buildRenewalPriceTable(offer({ aiEmployees: 7 }));
        const ai = rows.monthly.find((row) => row.title.startsWith('AI'));
        // 7500 за трёх + 4 × 1000
        expect(ai?.price).toBe('11 500 ₽');
        expect(ai?.title).toBe('AI-сервис — 7 сотрудников');
    });

    it('в примечании AI-сервиса виден коридор состава', () => {
        const rows = buildRenewalPriceTable(offer({ aiEmployees: 7 }));
        const ai = rows.monthly.find((row) => row.title.startsWith('AI'));
        expect(ai?.note).toContain('от 5 до 9 человек');
    });

    it('без коридора примечание про состав не пишется', () => {
        const rows = buildRenewalPriceTable(offer({ aiFreeDelta: 0 }));
        const ai = rows.monthly.find((row) => row.title.startsWith('AI'));
        expect(ai?.note).not.toContain('менять');
    });
});

describe('buildRenewalPriceTable: итоги и скидка', () => {
    it('итог совпадает с суммой включённых услуг', () => {
        const rows = buildRenewalPriceTable(
            offer({ salesPrice: 6500, managerIncluded: true }),
        );
        // 6500 + 7500 + 10000
        expect(rows.monthlyTotal).toBe('24 000 ₽');
    });

    it('скидка в рублях показывается с процентом и учтена в итоге', () => {
        const rows = buildRenewalPriceTable(
            offer({ adjustment: -2500, adjustmentLabel: 'Скидка за год' }),
        );
        // 5000 + 7500 = 12 500, скидка 2500 — это ровно 20%.
        expect(rows.servicesTotal).toBe(formatRub(12_500));
        expect(rows.discount).toEqual({
            label: 'Скидка за год',
            value: formatRub(-2_500),
            percent: 20,
        });
        expect(rows.monthlyTotal).toBe(formatRub(10_000));
    });

    it('скидка в процентах попадает в таблицу', () => {
        const rows = buildRenewalPriceTable(offer({ discountPercent: 20 }));
        expect(rows.servicesTotal).toBe(formatRub(12_500));
        expect(rows.discount).toEqual({
            label: 'Скидка',
            value: formatRub(-2_500),
            percent: 20,
        });
        expect(rows.monthlyTotal).toBe(formatRub(10_000));
    });

    it('заданный процент показывается как есть, а не пересчитывается', () => {
        // 15% от 33 ₽ — это 5 ₽ после округления, а обратный пересчёт дал бы 15,15.
        const rows = buildRenewalPriceTable(
            offer({
                salesPrice: 33,
                aiIncluded: false,
                discountPercent: 15,
            }),
        );
        expect(rows.discount?.percent).toBe(15);
    });

    it('без скидки нет ни её строки, ни промежуточной суммы', () => {
        const rows = buildRenewalPriceTable(offer());
        expect(rows.discount).toBeNull();
        expect(rows.surcharge).toBeNull();
        // Она совпала бы с итогом и только мешала бы.
        expect(rows.servicesTotal).toBeNull();
    });

    it('надбавка идёт отдельной строкой, не как скидка', () => {
        const rows = buildRenewalPriceTable(
            offer({ adjustment: 3000, adjustmentLabel: 'Надбавка' }),
        );
        expect(rows.discount).toBeNull();
        expect(rows.servicesTotal).toBe(formatRub(12_500));
        expect(rows.surcharge).toEqual({
            label: 'Надбавка',
            value: formatRub(3_000),
        });
        expect(rows.monthlyTotal).toBe(formatRub(15_500));
    });

    it('скидка и надбавка не показываются одновременно', () => {
        // Две взаимоисключающие строки в одном документе читались бы как
        // ошибка; процент имеет приоритет.
        const rows = buildRenewalPriceTable(
            offer({ discountPercent: 20, adjustment: 3000 }),
        );
        expect(rows.discount).not.toBeNull();
        expect(rows.surcharge).toBeNull();
    });
});

describe('buildRenewalPriceTable: дополнительные услуги', () => {
    it('месячные и разовые услуги разводятся по разным таблицам', () => {
        const rows = buildRenewalPriceTable(
            offer({
                extras: [
                    { title: 'Телефония', price: 3000, period: 'month' },
                    { title: 'Обучение', price: 15000, period: 'once' },
                ],
            }),
        );
        expect(rows.monthly.map((row) => row.title)).toContain('Телефония');
        expect(rows.once.map((row) => row.title)).toEqual(['Обучение']);
        expect(rows.onceTotal).toBe('15 000 ₽');
    });

    it('разовая услуга в месячный итог не входит', () => {
        const rows = buildRenewalPriceTable(
            offer({
                extras: [{ title: 'Обучение', price: 15000, period: 'once' }],
            }),
        );
        // 5000 + 7500, без 15000
        expect(rows.monthlyTotal).toBe('12 500 ₽');
    });

    it('услуга без названия в документ не печатается', () => {
        const rows = buildRenewalPriceTable(
            offer({
                extras: [
                    { title: '   ', price: 0, period: 'month' },
                    { title: '', price: 500, period: 'once' },
                ],
            }),
        );
        expect(rows.monthly).toHaveLength(3);
        expect(rows.once).toHaveLength(0);
    });

    it('без разовых услуг таблицы и итога разово нет', () => {
        const rows = buildRenewalPriceTable(offer());
        expect(rows.once).toHaveLength(0);
        expect(rows.onceTotal).toBeNull();
    });
});

