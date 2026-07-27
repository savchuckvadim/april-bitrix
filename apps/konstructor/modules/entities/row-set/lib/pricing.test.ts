import { describe, expect, it } from 'vitest';
import oldInit from '../../../../docs/oldinit.json';
import { catalogFromOldInit } from '../../catalog';
import {
    buildAcademyRow,
    buildGarantRow,
    buildServiceRow,
} from '../lib/build-row';
import { applyCommercialEdit, applyTaxChange } from '../lib/pricing';
import { buildTotalRow, createSet, upsertRow } from '../lib/row-set';

/**
 * Паритет цен с легаси-формулами (docs/legacy-core.md §6.2)
 * на эталонных данных docs/oldinit.json:
 * prices.prof: {complectNumber:0, supplyNumber:1, price:8187, region:0}.
 */
const catalog = catalogFromOldInit(oldInit);

const garant = (over: Partial<Parameters<typeof buildGarantRow>[0]> = {}) =>
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: 'row1',
        setId: 'general',
        role: 'main',
        complectCode: 'buh',
        supplyCode: 'internet_1',
        contractCode: 'internet',
        ...over,
    });

describe('паритет цен: PROF', () => {
    it('Бухгалтер × Интернет 1 ОД × internet × регионы = 8187', () => {
        const row = garant();
        expect(row).not.toBeNull();
        expect(row!.price.base).toBe(8187);
        expect(row!.price.current).toBe(8187);
        expect(row!.price.month).toBe(8187);
    });

    it('абонентский год: ×12 и скидка 0.8', () => {
        const row = garant({ contractCode: 'abonYear' });
        expect(row!.price.base).toBe(8187 * 12); // 98244
        expect(row!.price.current).toBe(78595.2);
        expect(row!.price.month).toBe(8187);
        expect(row!.price.measure.type).toBe(12);
    });

    it('налог поставщика 5% (не лицензионный договор)', () => {
        const row = garant({ withTax: true });
        expect(row!.price.base).toBe(8596.35); // 8187 × 1.05
    });

    it('лицензионный договор игнорирует налог', () => {
        const withTax = garant({ contractCode: 'licYear', withTax: true });
        const noTax = garant({ contractCode: 'licYear', withTax: false });
        expect(withTax!.price.base).toBe(noTax!.price.base);
        expect(withTax!.price.current).toBe(8187 * 12 * 0.8);
    });

    it('Москва берёт msk-цену из прайса', () => {
        const regionsRow = garant();
        const mskRow = garant({ regionCode: 'msk' });
        expect(mskRow!.price.base).toBeGreaterThan(regionsRow!.price.base);
    });
});

describe('паритет цен: универсальная линейка', () => {
    it('Классик = abs × region.abs × coefficient', () => {
        const row = garant({
            complectCode: 'classic',
            regionCode: 'kbr',
            supplyCode: 'internet_1',
        });
        // 2 × 3661.2 × 1.25 = 9153
        expect(row!.price.base).toBe(9153);
    });
});

describe('паритет цен: сервисы', () => {
    it('консалтинг: abs × region.abs (без коэффициента), × срок', () => {
        const sovex = catalog.services.consalting.find(s => s.code === 'sovex');
        const row = buildServiceRow({
            catalog,
            regionCode: 'kbr',
            withTax: false,
            key: 'c1',
            setId: 'general',
            role: 'main',
            productType: 'consalting',
            service: sovex!,
            supplyCode: 'internet_1',
            contractCode: 'abonYear',
        });
        // 1 × 3661.2 × 12 = 43934.4, скидка 0.8
        expect(row!.price.base).toBe(43934.4);
        expect(row!.price.current).toBe(35147.52);
    });

    it('СТАР msk-цена из прайса; бесплатен при withStar', () => {
        const star = catalog.services.star[0]!;
        const paid = buildServiceRow({
            catalog,
            regionCode: 'msk',
            withTax: false,
            key: 's1',
            setId: 'general',
            role: 'main',
            productType: 'star',
            service: star,
            supplyCode: 'internet_1',
            contractCode: 'internet',
        });
        expect(paid!.price.base).toBe(4600);

        const free = buildServiceRow({
            catalog,
            regionCode: 'msk',
            withTax: false,
            key: 's2',
            setId: 'general',
            role: 'main',
            productType: 'star',
            service: star,
            supplyCode: 'internet_1',
            contractCode: 'internet',
            isFree: true,
        });
        expect(free!.price.current).toBe(0);
        expect(free!.price.sum).toBe(0);
    });

    it('LT Малый пакет по региону', () => {
        const small = catalog.services.ltPackages.find(
            pkg => pkg.code === 'ltpackSmall',
        );
        const row = buildServiceRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'lt1',
            setId: 'general',
            role: 'main',
            productType: 'lt',
            service: small!,
            supplyCode: 'internet_1',
            contractCode: 'internet',
        });
        expect(row!.price.base).toBe(1800); // regions-цена Малого пакета
    });
});

describe('паритет цен: академия', () => {
    it('пакет «на срок» делится на свои месяцы, без налога', () => {
        const row = buildAcademyRow({
            catalog,
            regionCode: 'msk',
            withTax: true,
            key: 'a1',
            setId: 'general',
            role: 'main',
            academyCode: 'academy_15', // 12 мес, 384 ч, 28800
            supplyCode: 'internet_1',
            contractCode: 'abonYear',
        });
        // 28800 × 12 / 12 = 28800 (налог не применяется)
        expect(row!.price.base).toBe(28800);
    });

    it('открытый пакет: × срок × налог; несовместимый срок → null', () => {
        const open = buildAcademyRow({
            catalog,
            regionCode: 'msk',
            withTax: true,
            key: 'a2',
            setId: 'general',
            role: 'main',
            academyCode: 'academy_18', // 16 ч, 1500, любой срок
            supplyCode: 'internet_1',
            contractCode: 'internet',
        });
        expect(open!.price.base).toBe(1575); // 1500 × 1 × 1.05

        const incompatible = buildAcademyRow({
            catalog,
            regionCode: 'msk',
            withTax: false,
            key: 'a3',
            setId: 'general',
            role: 'main',
            academyCode: 'academy_1', // только 1 мес
            supplyCode: 'internet_1',
            contractCode: 'abonYear',
        });
        expect(incompatible).toBeNull();
    });
});

describe('редактирование коммерции', () => {
    const row = garant({ contractCode: 'abonYear' })!;

    it('скидка в процентах и рублях', () => {
        const percent = applyCommercialEdit(row.price, {
            kind: 'discountPercent',
            value: 0.5,
        });
        expect(percent.current).toBe(49122);

        const amount = applyCommercialEdit(row.price, {
            kind: 'discountAmount',
            value: 10000,
        });
        expect(amount.current).toBe(88244);
        expect(amount.discount.current).toBe('amount');
    });

    it('количество ограничено 0<q<100, sum пересчитывается', () => {
        const ok = applyCommercialEdit(row.price, {
            kind: 'quantity',
            value: 3,
        });
        expect(ok.sum).toBeCloseTo(ok.current * 3, 2);

        const rejected = applyCommercialEdit(row.price, {
            kind: 'quantity',
            value: 100,
        });
        expect(rejected.quantity).toBe(row.price.quantity);
    });

    it('смена налога поставщика не трогает лицензионные', () => {
        const licRow = garant({ contractCode: 'licYear', withTax: false })!;
        const contract = catalog.contracts.byCode['licYear']!;
        const unchanged = applyTaxChange(licRow.price, contract, false, true);
        expect(unchanged.base).toBe(licRow.price.base);

        const serviceContract = catalog.contracts.byCode['internet']!;
        const taxed = applyTaxChange(
            garant()!.price,
            serviceContract,
            false,
            true,
        );
        expect(taxed.base).toBe(8596.35);
    });
});

describe('total-строка сета', () => {
    it('склеивает имена и суммирует цены', () => {
        let set = createSet('general', 'general');
        set = upsertRow(set, garant()!);
        const star = catalog.services.star[0]!;
        set = upsertRow(set, {
            ...buildServiceRow({
                catalog,
                regionCode: 'stv',
                withTax: false,
                key: 's1',
                setId: 'general',
                role: 'main',
                productType: 'star',
                service: star,
                supplyCode: 'internet_1',
                contractCode: 'internet',
            })!,
        });
        const total = buildTotalRow(set);
        expect(total!.names.name).toContain(' + ');
        expect(total!.price.current).toBe(8187 + 3800); // СТАР regions = 3800
    });
});
