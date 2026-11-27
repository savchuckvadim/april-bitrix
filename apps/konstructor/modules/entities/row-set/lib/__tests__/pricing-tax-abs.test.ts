import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit, type Catalog } from '../../../catalog';
import { buildGarantRow, buildServiceRow } from '../row';

/**
 * Цены Универсала и консалтинга считаются от рабса региона с НДС (taxAbs), а
 * не от рабса без НДС: у Ставрополя в каталоге abs 3000 и taxAbs 3660 (×1.22).
 */
const base = catalogFromOldInit(oldInit);

const withStavropol = (patch: { abs?: number; taxAbs?: number }): Catalog => {
    const stv = { ...base.regions.byCode['stv']!, abs: 3000, taxAbs: 3660, ...patch };
    return {
        ...base,
        regions: {
            items: base.regions.items.map(region => (region.code === 'stv' ? stv : region)),
            byCode: { ...base.regions.byCode, stv },
        },
    };
};

const universal = (catalog: Catalog) =>
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: 'u1',
        setId: 'general',
        role: 'main',
        complectCode: 'classic',
        supplyCode: 'internet_1',
        contractCode: 'internet',
    });

const consalting = (catalog: Catalog) =>
    buildServiceRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: 'c1',
        setId: 'general',
        role: 'main',
        productType: 'consalting',
        service: catalog.services.consalting.find(service => service.code === 'sovex')!,
        supplyCode: 'internet_1',
        contractCode: 'internet',
    });

describe('цены от рабса с НДС', () => {
    it('Универсал: abs комплекта × taxAbs региона × коэффициент поставки', () => {
        const catalog = withStavropol({});
        const coefficient = catalog.supplies.byCode['internet_1']!.coefficient;
        const complectAbs = catalog.complects.byCode['classic']!.abs!;
        expect(universal(catalog)?.price.base).toBe(Math.round(complectAbs * 3660 * coefficient * 100) / 100);
    });

    it('рабс без НДС на цену не влияет', () => {
        expect(universal(withStavropol({ abs: 1 }))?.price.base).toBe(universal(withStavropol({ abs: 9999 }))?.price.base);
    });

    it('консалтинг: abs сервиса × taxAbs региона, срок договора и скидка по-прежнему', () => {
        const row = consalting(withStavropol({}));
        // sovex: abs 1 → 1 × 3660 за месяц, договор «internet» — один месяц без скидки
        expect(row?.price.base).toBe(3660);
    });

    it('у региона без рабса с НДС цены Универсала и консалтинга нет, нулевой строки не появляется', () => {
        const catalog = withStavropol({ taxAbs: 0 });
        expect(universal(catalog)).toBeNull();
        expect(consalting(catalog)).toBeNull();
    });

    it('ПРОФ от рабса не зависит: цена из прайс-таблицы', () => {
        const profPrice = (catalog: Catalog) =>
            buildGarantRow({
                catalog,
                regionCode: 'stv',
                withTax: false,
                key: 'p1',
                setId: 'general',
                role: 'main',
                complectCode: 'buh',
                supplyCode: 'internet_1',
                contractCode: 'internet',
            })?.price.base;
        expect(profPrice(withStavropol({ taxAbs: 0 }))).toBe(profPrice(withStavropol({ taxAbs: 5000 })));
        expect(profPrice(withStavropol({}))).toBeGreaterThan(0);
    });

    it('старая фикстура oldinit: легаси-abs уже с НДС лежит в taxAbs, суммы прежние', () => {
        const stv = base.regions.byCode['stv']!;
        expect(stv.taxAbs).toBe(stv.abs);
        expect(universal(base)?.price.base).toBe(9939);
    });
});
