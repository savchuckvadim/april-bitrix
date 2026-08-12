import { describe, expect, it } from 'vitest';
import type { PBXContactStateItem } from '../type/pbx-contact-type';
import { contactEmail, contactName, contactPhone } from './contact-view';

const contact = (raw: Record<string, unknown>): PBXContactStateItem =>
    raw as unknown as PBXContactStateItem;

describe('contactName', () => {
    it('склеивает имя и фамилию', () => {
        expect(
            contactName(contact({ ID: 7, NAME: 'Иван', LAST_NAME: 'Петров' })),
        ).toBe('Иван Петров');
    });

    it('безымянный контакт называется номером', () => {
        expect(contactName(contact({ ID: 12, NAME: '' }))).toBe('Контакт #12');
    });

    it('контакта нет — пустая строка', () => {
        expect(contactName(null)).toBe('');
    });
});

describe('contactPhone / contactEmail', () => {
    it('читает мультиполе Битрикса', () => {
        const item = contact({
            ID: 1,
            PHONE: [{ VALUE: '+79000000000', VALUE_TYPE: 'WORK' }],
            EMAIL: [{ VALUE: 'ivan@company.ru' }],
        });
        expect(contactPhone(item)).toBe('+79000000000');
        expect(contactEmail(item)).toBe('ivan@company.ru');
    });

    it('пропускает пустые значения и берёт первое непустое', () => {
        const item = contact({
            ID: 1,
            PHONE: [{ VALUE: '  ' }, { VALUE: '+79001112233' }],
        });
        expect(contactPhone(item)).toBe('+79001112233');
    });

    it('строку тоже понимает, пустоту отдаёт как null', () => {
        expect(contactPhone(contact({ ID: 1, PHONE: '+79005550000' }))).toBe(
            '+79005550000',
        );
        expect(contactPhone(contact({ ID: 1, PHONE: '' }))).toBeNull();
        expect(contactEmail(contact({ ID: 1 }))).toBeNull();
        expect(contactPhone(null)).toBeNull();
    });
});
