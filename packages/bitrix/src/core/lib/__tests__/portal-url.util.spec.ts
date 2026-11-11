import { describe, expect, it } from 'vitest';
import {
    getCrmUrl,
    getSafeExternalUrl,
    getTaskPath,
    getTaskUrl,
} from '../portal-url.util';

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

describe('getTaskPath (путь задачи для слайдера)', () => {
    it('без группы — путь через ответственного', () => {
        expect(getTaskPath(800805, { userId: '439' })).toBe(
            '/company/personal/user/439/tasks/task/view/800805/',
        );
    });

    it('группа важнее ответственного', () => {
        expect(getTaskPath('800805', { groupId: 89, userId: 439 })).toBe(
            '/workgroups/group/89/tasks/task/view/800805/',
        );
    });

    it('нет ни группы, ни ответственного — пользователь 0, портал разрулит доступ', () => {
        expect(getTaskPath(5, { groupId: 0, userId: null })).toBe(
            '/company/personal/user/0/tasks/task/view/5/',
        );
    });

    it('мусорный ID задачи — null, ссылку не рисуем', () => {
        expect(getTaskPath(0)).toBeNull();
        expect(getTaskPath(null)).toBeNull();
        expect(getTaskPath('abc')).toBeNull();
        expect(getTaskPath(1.5)).toBeNull();
    });
});

describe('getTaskUrl', () => {
    it('домен + путь задачи', () => {
        expect(
            getTaskUrl('garantservisvoronezh.bitrix24.ru', 800811, {
                userId: 439,
            }),
        ).toBe(
            'https://garantservisvoronezh.bitrix24.ru/company/personal/user/439/tasks/task/view/800811/',
        );
    });

    it('без домена — null: ссылка не уедет на текущий хост', () => {
        expect(getTaskUrl('', 800811)).toBeNull();
        expect(getTaskUrl(null, 800811)).toBeNull();
    });
});
