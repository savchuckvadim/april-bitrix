import { describe, expect, it } from 'vitest';
import { getCrmUrl, getSafeExternalUrl } from './url';

describe('getSafeExternalUrl', () => {
    it('пропускает абсолютный https с хостом', () => {
        expect(getSafeExternalUrl('https://forms.april.ru/quest/42')).toBe(
            'https://forms.april.ru/quest/42',
        );
    });

    it('пропускает http и обрезает пробелы', () => {
        expect(getSafeExternalUrl('  http://example.com/a  ')).toBe(
            'http://example.com/a',
        );
    });

    it('режет относительный путь — он открыл бы текущий хост', () => {
        expect(getSafeExternalUrl('/quest/42')).toBeNull();
        expect(getSafeExternalUrl('quest/42')).toBeNull();
    });

    it('режет javascript: и прочие схемы', () => {
        expect(getSafeExternalUrl('javascript:alert(1)')).toBeNull();
        expect(getSafeExternalUrl('data:text/html,x')).toBeNull();
        expect(getSafeExternalUrl('ftp://host.ru/file')).toBeNull();
    });

    it('режет пустое, null и хост без точки', () => {
        expect(getSafeExternalUrl('')).toBeNull();
        expect(getSafeExternalUrl(null)).toBeNull();
        expect(getSafeExternalUrl(undefined)).toBeNull();
        expect(getSafeExternalUrl('https://localhost/x')).toBeNull();
    });
});

describe('getCrmUrl (контракт гарда домена)', () => {
    it('пустой домен — null, ссылка не рисуется', () => {
        expect(getCrmUrl('', 'lead', 5)).toBeNull();
    });

    it('домен со схемой нормализуется', () => {
        expect(getCrmUrl('https://portal.bitrix24.ru/', 'contact', 7)).toBe(
            'https://portal.bitrix24.ru/crm/contact/details/7/',
        );
    });
});
