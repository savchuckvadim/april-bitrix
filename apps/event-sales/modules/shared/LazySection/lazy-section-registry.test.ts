import { beforeEach, describe, expect, it } from 'vitest';
import {
    isLazySectionOpened,
    markLazySectionOpened,
    resetLazySectionsForTests,
} from './lazy-section-registry';

describe('секции по требованию: память раскрытых на время фрейма', () => {
    beforeEach(() => {
        resetLazySectionsForTests();
    });

    it('пока не раскрыли — секция свёрнута и ничего не грузит', () => {
        expect(isLazySectionOpened('board:history')).toBe(false);
    });

    it('раскрытая остаётся раскрытой при возврате на экран', () => {
        markLazySectionOpened('board:history');

        expect(isLazySectionOpened('board:history')).toBe(true);
    });

    it('раскрытие одной секции не раскрывает соседние', () => {
        markLazySectionOpened('board:history');

        expect(isLazySectionOpened('board:duplicates')).toBe(false);
        expect(isLazySectionOpened('item:history')).toBe(false);
    });
});
