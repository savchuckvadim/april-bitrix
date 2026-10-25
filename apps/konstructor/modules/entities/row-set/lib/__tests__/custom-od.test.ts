import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import {
    catalogFromOldInit,
    filterContractsForSupply,
    makeCustomSupplyCode,
    parseCustomSupplyCode,
    referenceSupplyForCustom,
    resolveSupply,
} from '../../../catalog';
import { buildGarantRow } from '../row';
import { applyCommercialEdit, findProfBasePriceForSupply } from '../price';

/**
 * X-ОД: произвольное количество одновременных доступов через синтетический
 * код поставки x_<type>_<n>. Цена НЕ вычисляется (решение владельца 14):
 * коэффициент и прайс — у ближайшей справочной поставки того же типа
 * (снизу, иначе сверху), строка помечена ориентировочной.
 */

const catalog = catalogFromOldInit(oldInit);
const internet = (usersQuantity: number) =>
    catalog.supplies.items.find(
        supply =>
            supply.type === 'internet' &&
            supply.usersQuantity === usersQuantity &&
            supply.code === `internet_${usersQuantity}`,
    )!;

describe('X-ОД: код и резолв', () => {
    it('make/parse round-trip; мусор не парсится', () => {
        expect(parseCustomSupplyCode(makeCustomSupplyCode('internet', 7))).toEqual(
            { type: 'internet', usersQuantity: 7 },
        );
        expect(parseCustomSupplyCode('internet_1')).toBeNull();
        expect(parseCustomSupplyCode('x_internet_0')).toBeNull();
        expect(parseCustomSupplyCode('x_foo_5')).toBeNull();
    });

    it('resolveSupply: справочный код — как есть, кастомный — синтетика', () => {
        expect(resolveSupply(catalog, 'internet_1')?.code).toBe('internet_1');
        const custom = resolveSupply(catalog, 'x_internet_4')!;
        expect(custom.usersQuantity).toBe(4);
        expect(custom.type).toBe('internet');
        expect(custom.name).toContain('4 ОД');
        expect(custom.contractPropSuppliesQuantity).toBe('4');
        // подпись КП для X-ОД рендерит бэк по коду
        expect(custom.quantityForKp).toBeNull();
    });

    it('источник — ближайшая справочная снизу; особые (std/local/flash) не участвуют', () => {
        expect(referenceSupplyForCustom(catalog, 'internet', 4)?.code).toBe('internet_3');
        expect(referenceSupplyForCustom(catalog, 'internet', 5)?.code).toBe('internet_5');
        expect(referenceSupplyForCustom(catalog, 'proxima', 1)?.code).toBe('proxima_1');
        expect(referenceSupplyForCustom(catalog, 'internet', 999)?.code).toBe('internet_50');
    });

    it('коэффициент = коэффициент справочной поставки-источника (без интерполяции)', () => {
        expect(resolveSupply(catalog, 'x_internet_4')!.coefficient).toBe(
            internet(3).coefficient,
        );
        expect(resolveSupply(catalog, 'x_internet_60')!.coefficient).toBe(
            internet(50).coefficient,
        );
    });
});

describe('X-ОД: цены и совместимость', () => {
    it('PROF-цена = прайс справочной поставки-источника', () => {
        const direct3 = findProfBasePriceForSupply(
            catalog,
            'buh',
            resolveSupply(catalog, 'internet_3')!,
            'regions',
        )!;
        expect(
            findProfBasePriceForSupply(
                catalog,
                'buh',
                resolveSupply(catalog, 'x_internet_4')!,
                'regions',
            ),
        ).toBe(direct3);
    });

    it('garant-строка собирается с кастомным ОД и помечена ориентировочной', () => {
        const prof = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'r1',
            setId: 'general',
            role: 'main',
            complectCode: 'buh',
            supplyCode: 'x_internet_4',
            contractCode: 'internet',
        });
        expect(prof).not.toBeNull();
        expect(prof!.refs.supplyCode).toBe('x_internet_4');
        expect(prof!.price.base).toBeGreaterThan(0);
        expect(prof!.price.estimated).toBe(true);

        const reference = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'r0',
            setId: 'general',
            role: 'main',
            complectCode: 'buh',
            supplyCode: 'internet_3',
            contractCode: 'internet',
        })!;
        expect(prof!.price.base).toBe(reference.price.base);
        expect(reference.price.estimated).toBeUndefined();

        const universal = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'r2',
            setId: 'general',
            role: 'main',
            complectCode: 'classic',
            supplyCode: 'x_internet_4',
            contractCode: 'internet',
        })!;
        // abs × region.abs × коэффициент справочной поставки-источника
        expect(universal.price.base).toBeCloseTo(
            Math.round(2 * 3975.6 * internet(3).coefficient * 100) / 100,
            2,
        );
        expect(universal.price.estimated).toBe(true);
    });

    it('ручная правка цены снимает признак «ориентировочно»', () => {
        const row = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'r1',
            setId: 'general',
            role: 'main',
            complectCode: 'buh',
            supplyCode: 'x_internet_4',
            contractCode: 'internet',
        })!;
        const edited = applyCommercialEdit(row.price, { kind: 'price', value: 12345 });
        expect(edited.current).toBe(12345);
        expect(edited.estimated).toBeUndefined();
        // количество/скидка цену не задают — признак остаётся
        expect(
            applyCommercialEdit(row.price, { kind: 'quantity', value: 2 }).estimated,
        ).toBe(true);
    });

    it('матрица договоров работает для кастомного кода', () => {
        const contracts = filterContractsForSupply(
            catalog,
            'prof',
            'x_internet_4',
        );
        expect(contracts.map(contract => contract.code)).toContain('abonYear');
        expect(
            filterContractsForSupply(catalog, 'prof', 'x_proxima_4').map(
                contract => contract.code,
            ),
        ).toContain('proxima');
    });
});
