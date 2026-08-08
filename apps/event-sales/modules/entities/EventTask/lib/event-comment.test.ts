import { describe, expect, it } from 'vitest';
import { getTaskEventComment } from './event-comment';

describe('getTaskEventComment', () => {
    it('возвращает обрезанный текст комментария', () => {
        expect(
            getTaskEventComment({ ufTaskEventComment: '  показать налоговый блок  ' }),
        ).toBe('показать налоговый блок');
    });

    it('пустые значения Bitrix схлопывает в null', () => {
        expect(getTaskEventComment({ ufTaskEventComment: '' })).toBeNull();
        expect(getTaskEventComment({ ufTaskEventComment: '   ' })).toBeNull();
        expect(getTaskEventComment({ ufTaskEventComment: null })).toBeNull();
        expect(getTaskEventComment({ ufTaskEventComment: false })).toBeNull();
    });

    it('задача без поля или без объекта — null', () => {
        expect(getTaskEventComment({})).toBeNull();
        expect(getTaskEventComment(null)).toBeNull();
        expect(getTaskEventComment(undefined)).toBeNull();
    });
});
