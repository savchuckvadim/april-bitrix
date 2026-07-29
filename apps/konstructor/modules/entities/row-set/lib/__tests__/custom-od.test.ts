import { describe, expect, it } from 'vitest';
import oldInit from '../../../../../docs/oldinit.json';
import {
    catalogFromOldInit,
    filterContractsForSupply,
    makeCustomSupplyCode,
    parseCustomSupplyCode,
    resolveSupply,
} from '../../../catalog';
import { buildGarantRow } from '../row';
import { findProfBasePriceForSupply } from '../price';

/**
 * X-ОД: произвольное количество одновременных доступов через синтетический
 * код поставки x_<type>_<n>. Коэффициент и PROF-цена — линейная интерполяция
 * между соседними справочными поставками (рабочее допущение формулы).
 */

const catalog = catalogFromOldInit(oldInit);

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
    });

    it('коэффициент интерполируется между соседями', () => {
        const three = catalog.supplies.items.find(
            supply => supply.type === 'internet' && supply.usersQuantity === 3,
        )!;
        const five = catalog.supplies.items.find(
            supply => supply.type === 'internet' && supply.usersQuantity === 5,
        )!;
        const four = resolveSupply(catalog, 'x_internet_4')!;
        expect(four.coefficient).toBeCloseTo(
            (three.coefficient + five.coefficient) / 2,
            4,
        );
    });

    it('за пределами справочника — коэффициент ближней поставки', () => {
        const max = [...catalog.supplies.items]
            .filter(supply => supply.type === 'internet' && supply.usersQuantity > 0)
            .sort((a, b) => b.usersQuantity - a.usersQuantity)[0]!;
        const beyond = resolveSupply(
            catalog,
            makeCustomSupplyCode('internet', max.usersQuantity + 50),
        )!;
        expect(beyond.coefficient).toBe(max.coefficient);
    });
});

describe('X-ОД: цены и совместимость', () => {
    it('PROF-цена интерполируется между прайсами соседних поставок', () => {
        const direct3 = findProfBasePriceForSupply(
            catalog,
            'buh',
            resolveSupply(catalog, 'internet_3')!,
            'regions',
        )!;
        const direct5 = findProfBasePriceForSupply(
            catalog,
            'buh',
            resolveSupply(catalog, 'internet_5')!,
            'regions',
        )!;
        const interpolated = findProfBasePriceForSupply(
            catalog,
            'buh',
            resolveSupply(catalog, 'x_internet_4')!,
            'regions',
        )!;
        expect(interpolated).toBeCloseTo((direct3 + direct5) / 2, 2);
    });

    it('garant-строка собирается с кастомным ОД (PROF и универсал)', () => {
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
        });
        // abs × region.abs × интерполированный коэффициент
        const supply = resolveSupply(catalog, 'x_internet_4')!;
        expect(universal!.price.base).toBeCloseTo(
            Math.round(2 * 3975.6 * supply.coefficient * 100) / 100,
            2,
        );
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
