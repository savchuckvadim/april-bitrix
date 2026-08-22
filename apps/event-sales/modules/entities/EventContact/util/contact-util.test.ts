import { describe, expect, it } from 'vitest';
import { EV_CONTACT_PROP } from '../type/event-contact-type';
import { normalizePhone, validateInput } from './contact-util';

describe('normalizePhone', () => {
    it('снимает разделители набора', () => {
        expect(normalizePhone('+7 900 000-00-00')).toBe('+79000000000');
        expect(normalizePhone('8 (900) 000 00 00')).toBe('89000000000');
    });
});

describe('validateInput', () => {
    it('телефон в формате плейсхолдера принимается', () => {
        expect(validateInput('+7 900 000-00-00', EV_CONTACT_PROP.PHONE)).toBe(
            '',
        );
        expect(validateInput('8(900)000-00-00', EV_CONTACT_PROP.PHONE)).toBe(
            '',
        );
    });

    it('мусор вместо телефона не проходит', () => {
        expect(validateInput('телефон', EV_CONTACT_PROP.PHONE)).toBe(
            'Некорректный телефон',
        );
        expect(validateInput('', EV_CONTACT_PROP.PHONE)).toBe(
            'Некорректный телефон',
        );
    });

    it('почта проверяется без учёта случайных пробелов по краям', () => {
        expect(validateInput('  a@b.ru ', EV_CONTACT_PROP.EMAIL)).toBe('');
        expect(validateInput('a@b', EV_CONTACT_PROP.EMAIL)).toBe(
            'Некорректный email',
        );
    });
});
