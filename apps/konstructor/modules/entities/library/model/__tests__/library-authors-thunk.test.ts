import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppStore } from '@/modules/app/model/store';
import { fetchLibraryAuthors } from '../LibraryAuthorsThunk';
import { libraryReducer } from '../LibrarySlice';

const authors = vi.hoisted(() => ({ names: vi.fn() }));
vi.mock('../../lib/api/library-authors-helper', () => ({
    LibraryAuthorsHelper: class {
        names = authors.names;
    },
}));

/** Малый стор: thunk читает только слайс library, приведение к полному стору одно. */
const makeStore = () => {
    const store = configureStore({ reducer: { library: libraryReducer } });
    return { store, dispatch: store.dispatch as unknown as AppStore['dispatch'] };
};

describe('fetchLibraryAuthors', () => {
    beforeEach(() => {
        authors.names.mockReset();
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    it('спрашивает портал одним запросом и кладёт имена в кэш', async () => {
        authors.names.mockResolvedValue({ 11: 'Иван Петров', 12: 'Мария Орлова' });
        const { store, dispatch } = makeStore();

        await dispatch(fetchLibraryAuthors([11, 12]));

        expect(authors.names).toHaveBeenCalledTimes(1);
        expect(authors.names).toHaveBeenCalledWith([11, 12]);
        expect(store.getState().library.authorNames).toEqual({ 11: 'Иван Петров', 12: 'Мария Орлова' });
    });

    it('повторно уже спрошенных и известных не просит', async () => {
        authors.names.mockResolvedValue({ 11: 'Иван Петров' });
        const { dispatch } = makeStore();

        await dispatch(fetchLibraryAuthors([11]));
        await dispatch(fetchLibraryAuthors([11]));
        expect(authors.names).toHaveBeenCalledTimes(1);

        authors.names.mockResolvedValue({ 12: 'Мария Орлова' });
        await dispatch(fetchLibraryAuthors([11, 12]));
        expect(authors.names).toHaveBeenCalledTimes(2);
        expect(authors.names).toHaveBeenLastCalledWith([12]);
    });

    it('ошибка портала не бросается: имён нет, id можно спросить снова', async () => {
        authors.names.mockRejectedValueOnce(new Error('сеть'));
        const { store, dispatch } = makeStore();

        await expect(dispatch(fetchLibraryAuthors([11]))).resolves.toBeUndefined();
        expect(store.getState().library.authorNames).toEqual({});
        expect(store.getState().library.authorsRequested).toEqual([]);

        authors.names.mockResolvedValueOnce({ 11: 'Иван Петров' });
        await dispatch(fetchLibraryAuthors([11]));
        expect(store.getState().library.authorNames).toEqual({ 11: 'Иван Петров' });
    });
});
