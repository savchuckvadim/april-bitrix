import { describe, expect, it } from 'vitest';
import type { LibraryItem } from '../../model/dto';
import { filterLibraryItems, libraryItemTitle } from '../library-item.util';

const item = (over: Partial<LibraryItem>): LibraryItem => ({
    id: 1,
    kind: 'favorite',
    visibility: 'user',
    title: null,
    dealName: null,
    authorId: 10,
    departmentId: null,
    canEdit: true,
    isArchived: false,
    createdAt: null,
    updatedAt: null,
    ...over,
});

describe('library-item.util', () => {
    it('подпись: название → имя сделки → номер', () => {
        expect(libraryItemTitle(item({ title: ' Бухгалтер ' }))).toBe('Бухгалтер');
        expect(libraryItemTitle(item({ dealName: 'ООО Ромашка' }))).toBe('ООО Ромашка');
        expect(libraryItemTitle(item({ id: 7 }))).toBe('Заготовка №7');
    });

    it('фильтр: вид и область видимости', () => {
        const items = [
            item({ id: 1, authorId: 10 }),
            item({ id: 2, authorId: 11, visibility: 'department' }),
            item({ id: 3, authorId: 12, visibility: 'portal' }),
            item({ id: 4, kind: 'promotion', visibility: 'global', authorId: null }),
        ];
        expect(filterLibraryItems(items, 'favorite', 'all', 10).map(i => i.id)).toEqual([1, 2, 3]);
        expect(filterLibraryItems(items, 'favorite', 'own', 10).map(i => i.id)).toEqual([1]);
        expect(filterLibraryItems(items, 'favorite', 'department', 10).map(i => i.id)).toEqual([2]);
        expect(filterLibraryItems(items, 'promotion', 'portal', 10).map(i => i.id)).toEqual([4]);
    });
});
