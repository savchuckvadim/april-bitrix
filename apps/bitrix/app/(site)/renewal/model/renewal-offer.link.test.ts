import { describe, expect, it } from 'vitest';
import {
    RENEWAL_PATH,
    buildRenewalPath,
    buildRenewalPdfPath,
    buildRenewalUrl,
} from './renewal-offer.link';

describe('адреса предложения', () => {
    it('страница собирается из токена', () => {
        expect(buildRenewalPath('AbC123')).toBe('/renewal/AbC123');
    });

    it('PDF лежит рядом со страницей', () => {
        expect(buildRenewalPdfPath('AbC123')).toBe('/renewal/AbC123/pdf');
    });

    it('полная ссылка не удваивает слэш', () => {
        expect(buildRenewalUrl('AbC123', 'https://bitrix.april-app.ru/')).toBe(
            'https://bitrix.april-app.ru/renewal/AbC123',
        );
    });

    it('в адресе нет ни одной цены', () => {
        // Главное свойство: подменить стоимость в адресной строке нельзя.
        const url = buildRenewalUrl('AbC123', 'https://bitrix.april-app.ru');
        expect(url).not.toMatch(/\d{4}/);
        expect(url).not.toContain('=');
        expect(url).not.toContain('?');
    });

    it('опасные символы в токене экранируются', () => {
        // Токен приходит из адреса: без экранирования «../» уводил бы путь.
        expect(buildRenewalPath('../admin')).toBe('/renewal/..%2Fadmin');
    });

    it('корень раздела — /renewal', () => {
        expect(RENEWAL_PATH).toBe('/renewal');
    });
});
