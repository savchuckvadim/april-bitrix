/**
 * Активный пункт бокового меню: совпадение по сегменту пути и победа самой
 * длинной ссылки среди подходящих.
 */

import { describe, expect, it } from 'vitest';
import { resolveActiveSidebarHref } from './sidebar-active.util';

const PROVIDER = '/portal/42/provider';
const PROVIDER_IMAGES = '/portal/42/provider/images';

describe('resolveActiveSidebarHref', () => {
    it('адрес равен ссылке пункта', () => {
        expect(resolveActiveSidebarHref([PROVIDER, PROVIDER_IMAGES], PROVIDER)).toBe(PROVIDER);
    });

    it('вложенная страница подсвечивает пункт-родитель, если своего пункта у неё нет', () => {
        expect(
            resolveActiveSidebarHref([PROVIDER, '/portal/42/keys'], `${PROVIDER}/some-card`),
        ).toBe(PROVIDER);
    });

    it('когда подходят два пункта, горит самый конкретный', () => {
        expect(resolveActiveSidebarHref([PROVIDER, PROVIDER_IMAGES], PROVIDER_IMAGES)).toBe(
            PROVIDER_IMAGES,
        );
        expect(resolveActiveSidebarHref([PROVIDER_IMAGES, PROVIDER], PROVIDER_IMAGES)).toBe(
            PROVIDER_IMAGES,
        );
    });

    it('страница под конкретным пунктом остаётся за ним', () => {
        expect(
            resolveActiveSidebarHref([PROVIDER, PROVIDER_IMAGES], `${PROVIDER_IMAGES}/extra`),
        ).toBe(PROVIDER_IMAGES);
    });

    it('сравнение идёт по сегменту: «/contract» не горит на «/contract-template»', () => {
        expect(
            resolveActiveSidebarHref(['/contract', '/contract-template'], '/contract-template'),
        ).toBe('/contract-template');
        expect(resolveActiveSidebarHref(['/contract'], '/contract-template')).toBeNull();
    });

    it('чужой адрес и пустой путь ничего не подсвечивают', () => {
        expect(resolveActiveSidebarHref([PROVIDER], '/portal/42/keys')).toBeNull();
        expect(resolveActiveSidebarHref([PROVIDER], null)).toBeNull();
        expect(resolveActiveSidebarHref([PROVIDER], '')).toBeNull();
        expect(resolveActiveSidebarHref([], PROVIDER)).toBeNull();
    });
});
