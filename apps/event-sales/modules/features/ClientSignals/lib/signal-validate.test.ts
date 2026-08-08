import { describe, expect, it } from 'vitest';
import {
    appendMultifield,
    emailValidationError,
    multifieldValues,
    phoneValidationError,
} from './signal-validate';

describe('phoneValidationError / emailValidationError', () => {
    it('валидные проходят, ошибки конкретные', () => {
        expect(phoneValidationError('+7 (999) 123-45-67')).toBeNull();
        expect(phoneValidationError('12345')).toContain('5 цифр');
        expect(phoneValidationError('')).toBe('Введите номер телефона');

        expect(emailValidationError('name@domain.ru')).toBeNull();
        expect(emailValidationError('не почта')).toContain('не email');
        expect(emailValidationError('')).toBe('Введите email');
    });
});

describe('multifieldValues', () => {
    it('вытаскивает VALUE, пустое и мусор отбрасывает', () => {
        expect(
            multifieldValues([
                { ID: '1', VALUE: '+79991234567', VALUE_TYPE: 'WORK' },
                { VALUE: '' },
                null,
            ]),
        ).toEqual(['+79991234567']);
        expect(multifieldValues(undefined)).toEqual([]);
    });
});

describe('appendMultifield', () => {
    it('дополняет массив, существующие строки сохраняются', () => {
        const rows = appendMultifield(
            [{ ID: '1', VALUE: '+79991234567', VALUE_TYPE: 'WORK' }],
            'phone',
            '8 999 765-43-21',
        );
        expect(rows).toHaveLength(2);
        expect(rows?.[0]?.ID).toBe('1');
        expect(rows?.[1]).toEqual({
            VALUE: '8 999 765-43-21',
            VALUE_TYPE: 'WORK',
        });
    });

    it('дубль телефона ловится по последним 10 цифрам в любом формате', () => {
        expect(
            appendMultifield(
                [{ VALUE: '+7 (999) 123-45-67' }],
                'phone',
                '89991234567',
            ),
        ).toBeNull();
    });

    it('дубль email — без учёта регистра', () => {
        expect(
            appendMultifield([{ VALUE: 'Name@Domain.ru' }], 'email', 'name@domain.ru'),
        ).toBeNull();
    });
});
