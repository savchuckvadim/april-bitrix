import { describe, expect, it } from 'vitest';
import { isAlwaysVisiblePath } from './header-visibility';

describe('где хедер видно сразу', () => {
    it('на странице КП — видно', () => {
        expect(
            isAlwaysVisiblePath('/renewal/iQYvFq4KAaGUAyDuQ1k1aaKM'),
        ).toBe(true);
    });

    it('на корне раздела КП — видно', () => {
        expect(isAlwaysVisiblePath('/renewal')).toBe(true);
    });

    it('на лендинге поведение не меняется', () => {
        // Там хедер намеренно скрыт: первый экран не оставляет под него места.
        expect(isAlwaysVisiblePath('/home')).toBe(false);
    });

    it('на остальных страницах сайта поведение не меняется', () => {
        expect(isAlwaysVisiblePath('/offer')).toBe(false);
        expect(isAlwaysVisiblePath('/legal/privacy')).toBe(false);
        expect(isAlwaysVisiblePath('/support')).toBe(false);
    });

    it('похожий путь не считается КП', () => {
        // '/renewals' — не раздел КП, лишний префикс сюда попасть не должен.
        expect(isAlwaysVisiblePath('/renewals')).toBe(false);
        expect(isAlwaysVisiblePath('/renewal-offer')).toBe(false);
    });

    it('без пути ничего не ломается', () => {
        expect(isAlwaysVisiblePath(null)).toBe(false);
        expect(isAlwaysVisiblePath('')).toBe(false);
    });
});
