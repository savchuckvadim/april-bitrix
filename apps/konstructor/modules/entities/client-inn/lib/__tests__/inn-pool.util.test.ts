import { describe, expect, it } from 'vitest';
import { addInnToPool, isInnInPool, readInnPool } from '../inn-pool.util';

describe('readInnPool', () => {
    it('массив Битрикса: цифры, дубли схлопываются, порядок сохраняется', () => {
        expect(readInnPool(['7707083893', ' 5001007329 ', '7707083893'])).toEqual([
            '7707083893',
            '5001007329',
        ]);
    });

    it('строка с разделителями читается как список', () => {
        expect(readInnPool('7707083893, 5001007329;500100732259')).toEqual([
            '7707083893',
            '5001007329',
            '500100732259',
        ]);
    });

    it('пустое поле — пустой пул', () => {
        expect(readInnPool(null)).toEqual([]);
        expect(readInnPool('')).toEqual([]);
        expect(readInnPool(false)).toEqual([]);
        expect(readInnPool(undefined)).toEqual([]);
        expect(readInnPool([''])).toEqual([]);
    });
});

describe('addInnToPool', () => {
    it('нового ИНН в пуле нет — дописывается в конец, прежние целы', () => {
        const pool = ['7707083893'];
        expect(addInnToPool(pool, '5001007329')).toEqual(['7707083893', '5001007329']);
        expect(pool).toEqual(['7707083893']);
    });

    it('ИНН уже в пуле — дубля нет', () => {
        expect(addInnToPool(['7707083893', '5001007329'], '5001007329')).toEqual([
            '7707083893',
            '5001007329',
        ]);
    });

    it('isInnInPool отвечает по точному совпадению цифр', () => {
        expect(isInnInPool(['7707083893'], '7707083893')).toBe(true);
        expect(isInnInPool(['7707083893'], '5001007329')).toBe(false);
    });
});
