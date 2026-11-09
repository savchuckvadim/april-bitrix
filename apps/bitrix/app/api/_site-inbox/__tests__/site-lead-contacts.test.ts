/**
 * Правила контактов сайта должны совпадать с бэком: что форма пропустила,
 * то бэк примет. Расхождение — заявка с ошибкой вместо заявки в чате.
 */

import { describe, expect, it } from 'vitest';
import { hasCallablePhone, hasReachableContact, looksLikeEmail } from '../site-lead-contacts';

describe('hasCallablePhone', () => {
    it('десять цифр в любой записи — да, городской без кода — нет', () => {
        expect(hasCallablePhone('+7 (900) 123-45-67')).toBe(true);
        expect(hasCallablePhone('89001234567')).toBe(true);
        expect(hasCallablePhone('234-56-78')).toBe(false);
        expect(hasCallablePhone('-')).toBe(false);
    });
});

describe('looksLikeEmail', () => {
    it('обычные адреса — да', () => {
        for (const email of ['ivan@mail.ru', 'ivan.petrov@mail.ru', 'a-b@sub.domain.com', 'почта@пример.рф', ' ivan@mail.ru ']) {
            expect(looksLikeEmail(email), email).toBe(true);
        }
    });

    it('опечатки, которые бэк отвергнет, — нет', () => {
        for (const email of ['ivan.@mail.ru', 'ivan..petrov@mail.ru', 'ivan@mail.r', 'ivan@mail.ru.', 'ivan@mail..ru', 'ivan@mail', 'не почта', '']) {
            expect(looksLikeEmail(email), email).toBe(false);
        }
    });
});

describe('hasReachableContact', () => {
    it('хватит одного хорошего контакта', () => {
        expect(hasReachableContact({ phone: '234-56-78', email: 'ivan@mail.ru' })).toBe(true);
        expect(hasReachableContact({ phone: '+7 900 123-45-67', email: 'ivan.@mail.ru' })).toBe(true);
        expect(hasReachableContact({ phone: '234-56-78', email: 'ivan.@mail.ru' })).toBe(false);
        expect(hasReachableContact({})).toBe(false);
    });
});
