import { describe, expect, it } from 'vitest';
import {
    getHeadPerimeterCacheKey,
    isHeadPerimeter,
    sameSubordinates,
} from './head-perimeter-cache';

describe('head-perimeter-cache', () => {
    it('ключ свой у каждого пользователя: на общем компьютере подчинённые не смешиваются', () => {
        expect(getHeadPerimeterCacheKey('a.bitrix24.ru', 481)).not.toEqual(
            getHeadPerimeterCacheKey('a.bitrix24.ru', 482),
        );
    });

    it('в кэш попадает только список целых id', () => {
        expect(isHeadPerimeter({ subordinateIds: [231, 465] })).toBe(true);
        expect(isHeadPerimeter({ subordinateIds: [] })).toBe(true);
        expect(isHeadPerimeter({ subordinateIds: ['231'] })).toBe(false);
        expect(isHeadPerimeter(null)).toBe(false);
    });

    it('тот же состав в другом порядке — без повторного запроса дел', () => {
        expect(sameSubordinates([231, 465], [465, 231])).toBe(true);
        expect(sameSubordinates([231], [231, 465])).toBe(false);
        expect(sameSubordinates([231, 465], [231, 700])).toBe(false);
    });
});
