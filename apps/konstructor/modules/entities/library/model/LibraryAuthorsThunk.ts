import type { AppThunk } from '@/modules/app/model/store';
import { LibraryAuthorsHelper } from '../lib/api/library-authors-helper';
import { libraryActions } from './LibrarySlice';

const helper = new LibraryAuthorsHelper();

/**
 * Имена авторов чужих заготовок: один запрос к порталу на всех, кого ещё не
 * спрашивали. Ошибка не фатальна: карточка просто остаётся без строки автора,
 * а id освобождаются для следующего захода на экран.
 */
export const fetchLibraryAuthors =
    (ids: number[]): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const { authorNames, authorsRequested } = getState().library;
        const asked = new Set(authorsRequested);
        const fresh = ids.filter(id => !asked.has(id) && authorNames[id] === undefined);
        if (!fresh.length) return;
        dispatch(libraryActions.authorsRequested(fresh));
        try {
            dispatch(libraryActions.authorsLoaded(await helper.names(fresh)));
        } catch (error) {
            console.warn('library: имена авторов не получены', error);
            dispatch(libraryActions.authorsReleased(fresh));
        }
    };
