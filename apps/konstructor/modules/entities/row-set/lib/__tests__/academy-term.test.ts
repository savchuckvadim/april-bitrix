import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { academyPackagesFor, catalogFromOldInit } from '../../../catalog';
import { applyAction, defaultComposition, validateAcademy } from '../../../composition';
import { docComposition } from '../../../document-payload';
import type { RowSet } from '../../model/types';
import { buildGarantRow } from '../row';
import {
    applySetQuantity,
    createSet,
    setTermMonths,
    syncAcademyRow,
    syncSetWithComposition,
    upsertRow,
} from '../set';

/**
 * Академия привязана к сроку сделки (легаси useAcademy): срок = количество ×
 * договор; подходит только пакет на этот срок или «до конца комплекта». При
 * смене количества строка уходит и возвращается, выбор в наполнении остаётся.
 */
const catalog = catalogFromOldInit(oldInit);
const buh = catalog.complects.byCode['buh']!;
const context = { regionCode: 'stv', withTax: false };

const setWith = (
    academy: string | null,
    contractCode: string,
    quantity = 1,
    kind: RowSet['kind'] = 'general',
): RowSet => {
    const id = kind === 'general' ? 'general' : 'alt_1';
    const row = buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: `${id}_main`,
        setId: id,
        role: kind === 'general' ? 'main' : 'comparison',
        complectCode: 'buh',
        supplyCode: 'internet_1',
        contractCode,
        composition: { ...defaultComposition(buh), academy },
        quantity,
    })!;
    return syncSetWithComposition(upsertRow(createSet(id, kind), row), catalog, context);
};
const academyOf = (set: RowSet) => set.rows.find(row => row.productType === 'academy') ?? null;

describe('срок сделки', () => {
    it('количество × договор; подходящие пакеты — на этот срок и открытые', () => {
        expect(setTermMonths(setWith(null, 'internet', 12), catalog)).toBe(12);
        expect(setTermMonths(setWith(null, 'abonYear'), catalog)).toBe(12);
        expect(setTermMonths(setWith(null, 'internet', 3), catalog)).toBe(3);

        const codes = academyPackagesFor(catalog, 3).map(pkg => pkg.code);
        expect(codes).toEqual(['academy_2', 'academy_3', 'academy_4', 'academy_18', 'academy_19', 'academy_20', 'academy_21']);
        expect(academyPackagesFor(catalog, null)).toHaveLength(21);
    });
});

describe('строка академии', () => {
    it('интернет-договор на 12 месяцев: пакет на год подходит, цена пакета целиком', () => {
        const row = academyOf(setWith('academy_15', 'internet', 12))!;
        expect(row.price.quantity).toBe(12);
        expect(row.price.sum).toBe(28800);
    });

    it('пакет не под срок — строки нет, выбор в наполнении остаётся', () => {
        const set = setWith('academy_15', 'internet', 3);
        expect(academyOf(set)).toBeNull();
        expect(set.rows[0]!.composition?.academy).toBe('academy_15');
    });

    it('сервисные строки получают количество набора', () => {
        const set = setWith('academy_18', 'internet', 12);
        const row = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'general_main',
            setId: 'general',
            role: 'main',
            complectCode: 'buh',
            supplyCode: 'internet_1',
            contractCode: 'internet',
            composition: { ...defaultComposition(buh), academy: 'academy_18', consalting: 'sovex', ltInPacket: ['ltdisk', 'ltconnect'] },
            quantity: 12,
        })!;
        const synced = syncSetWithComposition(upsertRow(set, row), catalog, context);
        const quantities = Object.fromEntries(synced.rows.map(item => [item.productType, item.price.quantity]));
        expect(quantities).toMatchObject({ garant: 12, lt: 12, consalting: 12 });
        // открытый пакет живёт со своим количеством
        expect(quantities.academy).toBe(1);
    });

    it('академия есть и в наборе «для сравнения»', () => {
        expect(academyOf(setWith('academy_15', 'abonYear', 1, 'alternative'))?.refs.serviceCode).toBe('academy_15');
    });
});

describe('смена количества', () => {
    it('строка уходит, когда срок не совпал, и возвращается, когда совпал снова', () => {
        const start = setWith('academy_15', 'internet', 12);
        const shorter = syncAcademyRow(applySetQuantity(start, 3), catalog, context);
        expect(academyOf(shorter)).toBeNull();
        expect(shorter.rows[0]!.composition?.academy).toBe('academy_15');

        const back = syncAcademyRow(applySetQuantity(shorter, 12), catalog, context);
        expect(academyOf(back)?.price.sum).toBe(28800);
    });

    it('совпадающий срок: набор не трогается, ручные правки живы', () => {
        const start = setWith('academy_15', 'internet', 12);
        expect(syncAcademyRow(start, catalog, context)).toBe(start);
    });
});

describe('правило и документы', () => {
    const ctx = (termMonths: number | null) => ({ complect: buh, catalog, termMonths });

    it('пакет не под срок: выбрать нельзя, уже выбранный — предупреждение', () => {
        const blocked = applyAction(defaultComposition(buh), { kind: 'setAcademy', code: 'academy_15' }, ctx(3));
        expect(blocked.composition.academy).toBeNull();
        expect(blocked.violations.map(item => item.code)).toContain('academy/term-mismatch');

        const chosen = applyAction(defaultComposition(buh), { kind: 'setAcademy', code: 'academy_15' }, ctx(12));
        expect(chosen.composition.academy).toBe('academy_15');
        expect(validateAcademy(chosen.composition, ctx(3)).map(item => item.level)).toEqual(['warning']);
        expect(validateAcademy(chosen.composition, ctx(null))).toEqual([]);
    });

    it('в документ академия идёт только со строкой', () => {
        const fits = setWith('academy_15', 'internet', 12);
        expect(docComposition(fits.rows[0]!, fits)?.academy).toBe('academy_15');
        const notFits = setWith('academy_15', 'internet', 3);
        expect(docComposition(notFits.rows[0]!, notFits)?.academy).toBeNull();
    });
});
