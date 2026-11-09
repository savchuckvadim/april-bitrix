/**
 * Заявка на демо — единственное место раздела, где посетитель что-то
 * отправляет. Ошибка тут тихая и дорогая: потерянная заявка не видна никому.
 */

import { describe, expect, it } from 'vitest';
import {
    DEMO_REQUEST_HONEYPOT,
    DEMO_REQUEST_LIMITS,
    DEMO_REQUEST_MESSAGES,
    isHoneypotFilled,
    parseDemoRequest,
} from '../model/demo-request';

const VALID = {
    name: '  Ирина  ',
    phone: '+7 (900) 123-45-67',
    company: 'ООО «Пример», Воронеж',
    comment: 'Интересует AI-разбор звонков',
    consent: true,
    page: '/platform/ai',
};

describe('parseDemoRequest', () => {
    it('принимает заполненную форму и обрезает пробелы', () => {
        const result = parseDemoRequest(VALID);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.request.name).toBe('Ирина');
        expect(result.request.page).toBe('/platform/ai');
    });

    it('требует имя, телефон и согласие', () => {
        const result = parseDemoRequest({ ...VALID, name: '   ', phone: '12-34', consent: false });
        expect(result).toEqual({
            ok: false,
            errors: {
                name: DEMO_REQUEST_MESSAGES.name,
                phone: DEMO_REQUEST_MESSAGES.phone,
                consent: DEMO_REQUEST_MESSAGES.consent,
            },
        });
    });

    it('согласие — только явное true, а не строка из чужого клиента', () => {
        const result = parseDemoRequest({ ...VALID, consent: 'true' });
        expect(result.ok).toBe(false);
    });

    it('не падает на мусоре вместо тела запроса', () => {
        for (const input of [null, undefined, 'строка', 42, ['массив']]) {
            const result = parseDemoRequest(input);
            expect(result.ok).toBe(false);
        }
    });

    it('чужую страницу заменяет корнем раздела', () => {
        const result = parseDemoRequest({ ...VALID, page: 'https://evil.example/platform' });
        expect(result.ok && result.request.page).toBe('/platform');
        const lookalike = parseDemoRequest({ ...VALID, page: '/platformer' });
        expect(lookalike.ok && lookalike.request.page).toBe('/platform');
    });

    it('обрезает слишком длинный комментарий, а не отказывает', () => {
        const result = parseDemoRequest({ ...VALID, comment: 'а'.repeat(DEMO_REQUEST_LIMITS.comment + 50) });
        expect(result.ok && result.request.comment.length).toBe(DEMO_REQUEST_LIMITS.comment);
    });
});

describe('isHoneypotFilled', () => {
    it('пустая ловушка — человек', () => {
        expect(isHoneypotFilled({ ...VALID, [DEMO_REQUEST_HONEYPOT]: '' })).toBe(false);
        expect(isHoneypotFilled({ ...VALID, [DEMO_REQUEST_HONEYPOT]: '   ' })).toBe(false);
        expect(isHoneypotFilled(VALID)).toBe(false);
    });

    it('заполненная ловушка — бот', () => {
        expect(isHoneypotFilled({ ...VALID, [DEMO_REQUEST_HONEYPOT]: 'https://spam.example' })).toBe(true);
    });

    it('не падает на мусоре', () => {
        expect(isHoneypotFilled(null)).toBe(false);
        expect(isHoneypotFilled('строка')).toBe(false);
    });
});
