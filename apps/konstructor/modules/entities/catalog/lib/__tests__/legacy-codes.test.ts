import { describe, expect, it } from 'vitest';
import oldInit from '../__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../adapters/from-oldinit';
import {
    SUPPLY_CODE_FLASH,
    SUPPLY_CODE_LOCAL,
    SUPPLY_CODE_STD,
    SUPPLY_NUMBER_TO_KEY,
    supplyCodeFromNumber,
} from '../legacy-codes';

/**
 * Легаси-номер поставки (0..18) → code. Таблица — единственное место, где
 * number ещё живёт (адаптер v1/фикстуры); код же совпадает с админкой и
 * compatibility-matrix.
 */
const EXPECTED: Record<number, string> = {
    0: SUPPLY_CODE_STD,
    1: 'internet_1',
    2: 'internet_2',
    3: 'internet_3',
    4: 'internet_5',
    5: 'internet_10',
    6: 'internet_20',
    7: 'internet_30',
    8: 'internet_50',
    9: SUPPLY_CODE_LOCAL,
    10: SUPPLY_CODE_FLASH,
    11: 'proxima_1',
    12: 'proxima_2',
    13: 'proxima_3',
    14: 'proxima_5',
    15: 'proxima_10',
    16: 'proxima_20',
    17: 'proxima_30',
    18: 'proxima_50',
};

describe('legacy-codes: поставки', () => {
    it('все 19 легаси-номеров → code, коды уникальны', () => {
        const codes = Object.keys(EXPECTED).map(n => supplyCodeFromNumber(Number(n)));
        expect(codes).toHaveLength(19);
        expect(new Set(codes).size).toBe(19);
        for (const [number, code] of Object.entries(EXPECTED)) {
            expect(supplyCodeFromNumber(Number(number))).toBe(code);
        }
        expect(Object.keys(SUPPLY_NUMBER_TO_KEY)).toHaveLength(19);
    });

    it('неизвестный номер — предсказуемый код-заглушка, а не падение', () => {
        expect(supplyCodeFromNumber(99)).toBe('supply_99');
    });

    it('фикстура: Флэш и Локальная — проксима на 1 ОД, Стандартная — 0 ОД', () => {
        const catalog = catalogFromOldInit(oldInit);
        const flash = catalog.supplies.byCode[SUPPLY_CODE_FLASH]!;
        expect(flash.type).toBe('proxima');
        expect(flash.usersQuantity).toBe(1);
        // в договоре «количество поставок» у Флэш — слово, а не число
        expect(flash.contractPropSuppliesQuantity).toBe('Флэш');
        expect(catalog.supplies.byCode[SUPPLY_CODE_LOCAL]!.usersQuantity).toBe(1);
        expect(catalog.supplies.byCode[SUPPLY_CODE_STD]!.usersQuantity).toBe(0);
        expect(catalog.supplies.byCode['internet_5']!.contractPropSuppliesQuantity).toBe('5');
        expect(catalog.supplies.items).toHaveLength(19);
    });
});
