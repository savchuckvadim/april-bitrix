import { describe, expect, it } from 'vitest';
import type { LibraryItem, LibraryItemSummary } from '../../model/dto';
import {
    filterLibraryItems,
    libraryItemComposition,
    libraryItemMetaLines,
    libraryItemSavedLabel,
    libraryItemSource,
    libraryItemTitle,
} from '../library-item.util';

/** Разделитель тысяч в ru-RU — неразрывный пробел; в ожиданиях пишем обычный. */
const plain = (text: string | null): string | null => text?.replace(/\s/g, ' ') ?? null;

const summary = (over: Partial<LibraryItemSummary> = {}): LibraryItemSummary => ({
    complect: 'Гарант-Юрист',
    supply: 'Интернет 1 ОД',
    contract: 'Лицензионный полгода',
    sum: 27200,
    rowsCount: 1,
    ...over,
});

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

    it('легаси-избранное: {"value":""} вместо имени сделки', () => {
        const legacy = item({ dealName: '{"value":""}', createdAt: '2025-03-12T10:00:00Z' });
        expect(libraryItemTitle(legacy)).toBe('Без названия · 12.03.2025');
        expect(libraryItemTitle(item({ dealName: '{"value":"ООО Ромашка"}' }))).toBe('ООО Ромашка');
        expect(libraryItemSource(item({ title: 'Акция', dealName: '{"value":""}' }))).toBeUndefined();
        expect(libraryItemSource(item({ title: 'Акция', dealName: 'ООО Ромашка' }))).toBe(
            'Из сделки: ООО Ромашка',
        );
    });

    it('подпись с составом: название и имя сделки главнее комплекта, комплект главнее даты', () => {
        const withSummary = { summary: summary(), createdAt: '2025-03-12T10:00:00Z' };
        expect(libraryItemTitle(item({ ...withSummary, title: 'Бухгалтер' }))).toBe('Бухгалтер');
        expect(libraryItemTitle(item({ ...withSummary, dealName: 'ООО Ромашка' }))).toBe('ООО Ромашка');
        expect(libraryItemTitle(item(withSummary))).toBe('Гарант-Юрист');
        expect(libraryItemTitle(item({ ...withSummary, summary: summary({ complect: '  ' }) }))).toBe(
            'Без названия · 12.03.2025',
        );
        expect(libraryItemTitle(item({ summary: null, id: 9 }))).toBe('Заготовка №9');
    });

    it('состав: все части через «·»', () => {
        expect(plain(libraryItemComposition(item({ summary: summary() })))).toBe(
            'Интернет 1 ОД · Лицензионный полгода · 27 200 ₽',
        );
    });

    it('состав: пустые части пропускаются, суммы нет — строка без суммы', () => {
        expect(libraryItemComposition(item({ summary: summary({ supply: null }) }))?.startsWith('Лицензионный')).toBe(
            true,
        );
        expect(libraryItemComposition(item({ summary: summary({ contract: '', sum: null }) }))).toBe(
            'Интернет 1 ОД',
        );
        expect(
            libraryItemComposition(item({ summary: summary({ supply: null, contract: null, sum: null }) })),
        ).toBeNull();
    });

    it('состав: «+ ещё N позиции» при нескольких строках набора', () => {
        const base = { supply: null, contract: null, sum: null };
        expect(libraryItemComposition(item({ summary: summary({ ...base, rowsCount: 1 }) }))).toBeNull();
        expect(libraryItemComposition(item({ summary: summary({ ...base, rowsCount: 2 }) }))).toBe(
            '+ ещё 1 позиция',
        );
        expect(libraryItemComposition(item({ summary: summary({ ...base, rowsCount: 3 }) }))).toBe(
            '+ ещё 2 позиции',
        );
        expect(libraryItemComposition(item({ summary: summary({ ...base, rowsCount: 6 }) }))).toBe(
            '+ ещё 5 позиций',
        );
        expect(plain(libraryItemComposition(item({ summary: summary({ rowsCount: 3 }) })))).toBe(
            'Интернет 1 ОД · Лицензионный полгода · 27 200 ₽ · + ещё 2 позиции',
        );
    });

    it('состав: нулевая сумма показывается; старый бэк без состава даёт пустоту', () => {
        expect(plain(libraryItemComposition(item({ summary: summary({ supply: null, contract: null, sum: 0 }) })))).toBe(
            '0 ₽',
        );
        expect(libraryItemComposition(item({}))).toBeNull();
        expect(libraryItemComposition(item({ summary: null }))).toBeNull();
    });

    it('дата сохранения: только когда её нет в подписи', () => {
        const created = { createdAt: '2025-03-12T10:00:00Z' };
        expect(libraryItemSavedLabel(item({ ...created, title: 'Бухгалтер' }))).toBe('Сохранено 12.03.2025');
        expect(libraryItemSavedLabel(item({ ...created, summary: summary() }))).toBe('Сохранено 12.03.2025');
        expect(libraryItemSavedLabel(item(created))).toBeNull();
        expect(libraryItemSavedLabel(item({ title: 'Бухгалтер' }))).toBeNull();
    });

    it('строки карточки: состав, сделка, дата и автор', () => {
        const full = item({
            title: 'Акция',
            dealName: 'ООО Ромашка',
            createdAt: '2025-03-12T10:00:00Z',
            summary: summary(),
        });
        expect(libraryItemMetaLines(full, 'Автор: Иван Петров').map(plain)).toEqual([
            'Интернет 1 ОД · Лицензионный полгода · 27 200 ₽',
            'Из сделки: ООО Ромашка',
            'Сохранено 12.03.2025 · Автор: Иван Петров',
        ]);
        expect(libraryItemMetaLines(full)).toHaveLength(3);
    });

    it('строки карточки: старый бэк — как раньше, без даты; автор показывается и без состава', () => {
        const legacy = item({ title: 'Акция', dealName: 'ООО Ромашка', createdAt: '2025-03-12T10:00:00Z' });
        expect(libraryItemMetaLines(legacy)).toEqual(['Из сделки: ООО Ромашка']);
        expect(libraryItemMetaLines(item({}))).toEqual([]);
        expect(libraryItemMetaLines(item({}), 'Автор: Иван Петров')).toEqual(['Автор: Иван Петров']);
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
