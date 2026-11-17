import { describe, expect, it } from 'vitest';
import { isTheoryScreenShown } from './theory-copy';

describe('isTheoryScreenShown', () => {
    it('на проде место под скрин без картинки не рисуется', () => {
        expect(isTheoryScreenShown({}, false)).toBe(false);
        expect(isTheoryScreenShown({ src: '' }, false)).toBe(false);
    });

    it('скрин с картинкой рисуется всегда', () => {
        expect(isTheoryScreenShown({ src: '/media/ai/a.webp' }, false)).toBe(
            true,
        );
        expect(isTheoryScreenShown({ src: '/media/ai/a.webp' }, true)).toBe(
            true,
        );
    });

    it('при разработке пустое место видно — по нему снимают скрины', () => {
        expect(isTheoryScreenShown({}, true)).toBe(true);
    });
});
