import { describe, expect, it } from 'vitest';
import {
    STAGE_DICT_CACHE_VERSION,
    getStageDictCacheKey,
    isStageDictPayload,
} from './stage-dict-cache';

describe('кэш словарей стадий: ключ', () => {
    it('у каждой воронки и каждого портала своя ячейка', () => {
        const base = getStageDictCacheKey('a.bitrix24.ru', 'DEAL_STAGE_31');

        expect(base).toEqual({
            name: 'event-sales:stage-dict:DEAL_STAGE_31',
            domain: 'a.bitrix24.ru',
            version: STAGE_DICT_CACHE_VERSION,
        });
        expect(getStageDictCacheKey('a.bitrix24.ru', 'DEAL_STAGE').name).not.toBe(
            base.name,
        );
        expect(
            getStageDictCacheKey('b.bitrix24.ru', 'DEAL_STAGE_31').domain,
        ).toBe('b.bitrix24.ru');
    });
});

describe('кэш словарей стадий: что можно положить', () => {
    it('непустой словарь стадий — можно', () => {
        expect(
            isStageDictPayload([
                { statusId: 'C31:NEW', name: 'Новая', color: '#EEF0E6' },
                { statusId: 'C31:WON', name: 'Успех' },
            ]),
        ).toBe(true);
    });

    it('пустой ответ не кэшируется — иначе полоски сутки без стадий', () => {
        expect(isStageDictPayload([])).toBe(false);
    });

    it('чужая форма не кэшируется', () => {
        expect(isStageDictPayload(null)).toBe(false);
        expect(isStageDictPayload({ statusId: 'NEW' })).toBe(false);
        expect(isStageDictPayload([{ statusId: 1, name: 'Новая' }])).toBe(false);
        expect(isStageDictPayload([{ statusId: 'NEW' }])).toBe(false);
    });
});
