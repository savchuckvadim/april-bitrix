import { describe, expect, it } from 'vitest';
import {
    innValidationError,
    isValidInn,
    mergeInnPool,
    normalizeInn,
} from './inn-validate';

describe('isValidInn', () => {
    it('валидные ИНН юрлица (10) и ИП (12)', () => {
        expect(isValidInn('7707083893')).toBe(true);
        expect(isValidInn('500100732259')).toBe(true);
    });

    it('битая контрольная сумма и неверная длина — отказ', () => {
        expect(isValidInn('7707083894')).toBe(false);
        expect(isValidInn('500100732258')).toBe(false);
        expect(isValidInn('77070838')).toBe(false);
        expect(isValidInn('77070838931')).toBe(false);
        expect(isValidInn('')).toBe(false);
    });
});

describe('normalizeInn', () => {
    it('чистит нецифровые символы и валидирует', () => {
        expect(normalizeInn(' 7707-083-893 ')).toBe('7707083893');
        expect(normalizeInn('ИНН 500100732259')).toBe('500100732259');
    });

    it('невалидное и пустое — null', () => {
        expect(normalizeInn('1234567890')).toBeNull();
        expect(normalizeInn(null)).toBeNull();
        expect(normalizeInn('')).toBeNull();
    });
});

describe('innValidationError', () => {
    it('валидный — null, различает длину и контрольную сумму', () => {
        expect(innValidationError('7707083893')).toBeNull();
        expect(innValidationError('')).toBe('Введите ИНН');
        expect(innValidationError('12345')).toContain('5 цифр');
        expect(innValidationError('7707083894')).toContain(
            'контрольная сумма',
        );
    });
});

describe('mergeInnPool', () => {
    it('уникально сливает существующие и новые, порядок сохраняется', () => {
        expect(
            mergeInnPool(['7707083893'], '500100732259', '7707083893'),
        ).toEqual(['7707083893', '500100732259']);
    });

    it('невалидные и пустые отбрасываются, скаляр existing поддержан', () => {
        expect(mergeInnPool('7707083893', null, '123')).toEqual([
            '7707083893',
        ]);
        expect(mergeInnPool(undefined, '500100732259')).toEqual([
            '500100732259',
        ]);
    });
});
