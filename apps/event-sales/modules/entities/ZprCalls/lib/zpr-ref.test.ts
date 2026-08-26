import { describe, expect, it } from 'vitest';
import {
    mergeZprRefs,
    parseZprRef,
    parseZprRefs,
    zprRefsKey,
} from './zpr-ref';

describe('parseZprRef', () => {
    it('разбирает боевой формат бэка T{hex}_{id}', () => {
        // 0x40e = 1038 — entityTypeId динамического типа из постановки.
        expect(parseZprRef('T40e_501')).toEqual({
            entityTypeId: 1038,
            elementId: 501,
        });
    });

    it('терпит регистр и пробелы по краям', () => {
        expect(parseZprRef(' t40E_7 ')).toEqual({
            entityTypeId: 1038,
            elementId: 7,
        });
    });

    it('отбрасывает обычные crm-привязки — это не элементы смарта', () => {
        expect(parseZprRef('D_5')).toBeNull();
        expect(parseZprRef('CO_7')).toBeNull();
        expect(parseZprRef('L_9')).toBeNull();
        expect(parseZprRef('C_11')).toBeNull();
    });

    it('отбрасывает мусор', () => {
        expect(parseZprRef('')).toBeNull();
        expect(parseZprRef('T_5')).toBeNull(); // нет hex-части
        expect(parseZprRef('T40e_')).toBeNull(); // нет id
        expect(parseZprRef('T40e_0')).toBeNull(); // id не положительный
        expect(parseZprRef('T0_5')).toBeNull(); // entityTypeId не положительный
        expect(parseZprRef('Txyz_1')).toBeNull(); // не hex
        expect(parseZprRef('T40e_5_9')).toBeNull(); // лишний хвост
        expect(parseZprRef('T40e-5')).toBeNull(); // не тот разделитель
        expect(parseZprRef(null)).toBeNull();
        expect(parseZprRef(undefined)).toBeNull();
        expect(parseZprRef({})).toBeNull();
        expect(parseZprRef([])).toBeNull();
    });
});

describe('parseZprRefs', () => {
    it('массив значений → уникальные ссылки, мусор молча пропущен', () => {
        expect(
            parseZprRefs(['T40e_501', 'D_5', 'T40e_501', 'T40e_502', 42, '']),
        ).toEqual([
            { entityTypeId: 1038, elementId: 501 },
            { entityTypeId: 1038, elementId: 502 },
        ]);
    });

    it('одиночная строка трактуется как одно значение', () => {
        expect(parseZprRefs('T40e_501')).toEqual([
            { entityTypeId: 1038, elementId: 501 },
        ]);
    });

    it('пусто/не то → пустой список (self-gate слайса)', () => {
        expect(parseZprRefs(undefined)).toEqual([]);
        expect(parseZprRefs(null)).toEqual([]);
        expect(parseZprRefs([])).toEqual([]);
        expect(parseZprRefs({ nope: true })).toEqual([]);
    });
});

describe('mergeZprRefs / zprRefsKey', () => {
    it('объединяет сделку и компанию без дублей', () => {
        const deal = parseZprRefs(['T40e_501', 'T40e_502']);
        const company = parseZprRefs(['T40e_502', 'T40e_503']);
        expect(mergeZprRefs(deal, company).map(ref => ref.elementId)).toEqual([
            501, 502, 503,
        ]);
    });

    it('ключ набора стабилен к порядку — queryKey не дёргается', () => {
        const forward = parseZprRefs(['T40e_501', 'T40e_502']);
        const backward = parseZprRefs(['T40e_502', 'T40e_501']);
        expect(zprRefsKey(forward)).toBe(zprRefsKey(backward));
    });
});
