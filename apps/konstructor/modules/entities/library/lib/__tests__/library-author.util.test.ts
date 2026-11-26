import { describe, expect, it } from 'vitest';
import {
    foreignAuthorIds,
    libraryItemAuthorLabel,
    namesByUserId,
    portalUserName,
} from '../library-author.util';

const NAMES = { 11: 'Иван Петров', 12: 'Мария Орлова' };

describe('library-author.util', () => {
    it('имя сотрудника: имя и фамилия, пустое — без имени', () => {
        expect(portalUserName({ NAME: ' Иван ', LAST_NAME: 'Петров' })).toBe('Иван Петров');
        expect(portalUserName({ LAST_NAME: 'Петров' })).toBe('Петров');
        expect(portalUserName({})).toBe('');
    });

    it('карта имён: id приводится к числу, безымянные и без id пропускаются', () => {
        expect(
            namesByUserId([
                { ID: '11', NAME: 'Иван', LAST_NAME: 'Петров' },
                { ID: 12, NAME: 'Мария', LAST_NAME: 'Орлова' },
                { ID: 13 },
                { NAME: 'Без', LAST_NAME: 'Идентификатора' },
            ]),
        ).toEqual(NAMES);
    });

    it('чужие авторы: без повторов, без себя и без заготовок без автора', () => {
        const items = [
            { authorId: 10 },
            { authorId: 11 },
            { authorId: 11 },
            { authorId: 12 },
            { authorId: null },
        ];
        expect(foreignAuthorIds(items, 10)).toEqual([11, 12]);
        expect(foreignAuthorIds([{ authorId: 10 }, { authorId: null }], 10)).toEqual([]);
    });

    it('«Автор: …» только на чужих карточках', () => {
        expect(libraryItemAuthorLabel({ authorId: 11 }, 10, NAMES)).toBe('Автор: Иван Петров');
        expect(libraryItemAuthorLabel({ authorId: 10 }, 10, NAMES)).toBeUndefined();
    });

    it('«Автор: …» нет, когда сказать нечего: имя не загрузилось, автора нет, пользователь неизвестен', () => {
        expect(libraryItemAuthorLabel({ authorId: 99 }, 10, NAMES)).toBeUndefined();
        expect(libraryItemAuthorLabel({ authorId: null }, 10, NAMES)).toBeUndefined();
        expect(libraryItemAuthorLabel({ authorId: 11 }, null, NAMES)).toBeUndefined();
        expect(libraryItemAuthorLabel({ authorId: 11 }, 10, {})).toBeUndefined();
    });
});
