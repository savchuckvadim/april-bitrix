import { describe, expect, it } from 'vitest';
import { digitsOf, isValidInn, normalizeInn } from '../inn-validate.util';

describe('isValidInn', () => {
    it.each(['7707083893', '5001007329', '500100732259', '772756377869'])(
        '%s сходится по контрольной сумме',
        inn => {
            expect(isValidInn(inn)).toBe(true);
        },
    );

    it.each(['7707083894', '500100732250', '123', '77070838931', 'abcdefghij'])(
        '%s не принимается',
        inn => {
            expect(isValidInn(inn)).toBe(false);
        },
    );
});

describe('normalizeInn', () => {
    it('оставляет цифры и проверяет контрольную сумму', () => {
        expect(normalizeInn(' 7707 083-893 ')).toBe('7707083893');
        expect(normalizeInn('7707083894')).toBeNull();
    });

    it('пустое и не строка — null', () => {
        expect(normalizeInn('')).toBeNull();
        expect(normalizeInn(null)).toBeNull();
        expect(normalizeInn(undefined)).toBeNull();
        expect(normalizeInn(false)).toBeNull();
    });
});

describe('digitsOf', () => {
    it('число и строка дают цифры, остальное пусто', () => {
        expect(digitsOf(7707083893)).toBe('7707083893');
        expect(digitsOf('ИНН 7707083893')).toBe('7707083893');
        expect(digitsOf({})).toBe('');
    });
});
