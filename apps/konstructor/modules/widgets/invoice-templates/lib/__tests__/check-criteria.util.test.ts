import { describe, expect, it } from 'vitest';
import {
    CHECK_ANY,
    fromCheckValue,
    toCheckValue,
    withAnyOption,
} from '../check-criteria.util';

describe('check-criteria.util', () => {
    const codes = ['internet', 'proxima'] as const;

    it('«не задан» идёт первым пунктом списка', () => {
        const options = withAnyOption('Не задан', [
            { value: 'internet', label: 'Интернет' },
        ]);

        expect(options).toEqual([
            { value: CHECK_ANY, label: 'Не задан' },
            { value: 'internet', label: 'Интернет' },
        ]);
    });

    it('нет кода значит служебное значение, иначе сам код', () => {
        expect(toCheckValue(null)).toBe(CHECK_ANY);
        expect(toCheckValue('proxima')).toBe('proxima');
    });

    it('из значения селекта получается код; «не задан» и чужое значение дают null', () => {
        expect(fromCheckValue('proxima', codes)).toBe('proxima');
        expect(fromCheckValue(CHECK_ANY, codes)).toBeNull();
        expect(fromCheckValue('cloud', codes)).toBeNull();
    });
});
