import { describe, expect, it } from 'vitest';
import oldInit from '../__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../adapters/from-oldinit';
import {
    allowedContractCodes,
    filterContractsForSupply,
    filterSuppliesForComplect,
    isCompatible,
    resolveContractForSupplyChange,
    resolveRefsForComplectChange,
} from '../compatibility-matrix';
import { SUPPLY_CODE_FLASH, SUPPLY_CODE_LOCAL, SUPPLY_CODE_STD } from '../legacy-codes';

/**
 * Паритет с легаси filterSupplies / filterContracts / generateGarantProducts:
 * PROF — без Стандартной (0 ОД) и Локальной; Флэш — только договор услуг
 * «проксима»; универсал — все поставки, без абонентских договоров.
 */
const catalog = catalogFromOldInit(oldInit);
const codes = (items: Array<{ code: string }>) => items.map(item => item.code);

describe('compatibility-matrix: поставки по линейке', () => {
    it('PROF: 17 из 19 — без Стандартной и Локальной', () => {
        const prof = codes(filterSuppliesForComplect(catalog.supplies.items, 'prof'));
        expect(prof).toHaveLength(17);
        expect(prof).not.toContain(SUPPLY_CODE_STD);
        expect(prof).not.toContain(SUPPLY_CODE_LOCAL);
        expect(prof).toContain(SUPPLY_CODE_FLASH);
    });

    it('универсал: все 19', () => {
        expect(
            filterSuppliesForComplect(catalog.supplies.items, 'universal'),
        ).toHaveLength(19);
    });
});

describe('compatibility-matrix: договоры по поставке', () => {
    it('интернет PROF — услуги, абонентские, лицензионные, ключ', () => {
        expect(allowedContractCodes('prof', { type: 'internet', code: 'internet_5' })).toEqual([
            'internet',
            'abonHalf',
            'abonYear',
            'abonTwoYears',
            'licHalf',
            'licYear',
            'licTwoYears',
            'key',
        ]);
    });

    it('интернет универсал — без абонентских', () => {
        const allowed = allowedContractCodes('universal', {
            type: 'internet',
            code: 'internet_5',
        });
        expect(allowed).not.toContain('abonYear');
        expect(allowed).toContain('internet');
        expect(allowed).toContain('licYear');
    });

    it('Флэш — только договор услуг «проксима» в обеих линейках', () => {
        for (const complectType of ['prof', 'universal'] as const) {
            expect(
                codes(filterContractsForSupply(catalog, complectType, SUPPLY_CODE_FLASH)),
            ).toEqual(['proxima']);
        }
    });

    it('проксима N ОД — услуги, лицензионные, ключ (без абонентских)', () => {
        const allowed = allowedContractCodes('prof', { type: 'proxima', code: 'proxima_5' });
        expect(allowed).toEqual(['proxima', 'licHalf', 'licYear', 'licTwoYears', 'key']);
        // в фикстуре договора key нет — фильтр отдаёт только существующие
        expect(codes(filterContractsForSupply(catalog, 'prof', 'proxima_5'))).toEqual([
            'proxima',
            'licHalf',
            'licYear',
            'licTwoYears',
        ]);
    });

    it('isCompatible: абонентский к проксиме — нет, к интернету PROF — да', () => {
        expect(isCompatible(catalog, 'prof', 'proxima_5', 'abonYear')).toBe(false);
        expect(isCompatible(catalog, 'prof', 'internet_5', 'abonYear')).toBe(true);
        expect(isCompatible(catalog, 'prof', 'nope', 'internet')).toBe(false);
    });
});

describe('compatibility-matrix: цепочка сброса', () => {
    it('смена линейки на PROF сбрасывает Стандартную на первую допустимую, договор — на допустимый', () => {
        const prof = catalog.complects.prof[0]!;
        const refs = resolveRefsForComplectChange(catalog, prof.code, {
            supplyCode: SUPPLY_CODE_STD,
            contractCode: 'internet',
        })!;
        expect(refs.supplyCode).not.toBe(SUPPLY_CODE_STD);
        expect(isCompatible(catalog, 'prof', refs.supplyCode, refs.contractCode)).toBe(true);
    });

    it('совместимые прежние значения сохраняются; несовместимый договор → первый допустимый', () => {
        const prof = catalog.complects.prof[0]!;
        expect(
            resolveRefsForComplectChange(catalog, prof.code, {
                supplyCode: 'internet_5',
                contractCode: 'abonYear',
            }),
        ).toEqual({ supplyCode: 'internet_5', contractCode: 'abonYear' });
        expect(
            resolveContractForSupplyChange(catalog, 'prof', SUPPLY_CODE_FLASH, 'abonYear'),
        ).toBe('proxima');
    });
});
