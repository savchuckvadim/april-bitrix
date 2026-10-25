import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LibraryItem, LibraryRights } from './dto';

export type LibraryStatus = 'idle' | 'loading' | 'ready' | 'error';
export type LibraryActionStatus = 'idle' | 'busy' | 'done' | 'error';

export interface LibraryState {
    /** Всё, что видно пользователю (избранное и акции вместе); фильтр по kind — в селекторах */
    items: LibraryItem[];
    status: LibraryStatus;
    error: string | null;
    /** Что пользователю можно сохранять (видимости по роли) */
    rights: LibraryRights | null;
    /** Сохранение в библиотеку / правка / удаление */
    actionStatus: LibraryActionStatus;
    actionError: string | null;
    /** Загрузка заготовки в конструктор (id в работе) */
    loadingId: number | null;
}

const initialState: LibraryState = {
    items: [],
    status: 'idle',
    error: null,
    rights: null,
    actionStatus: 'idle',
    actionError: null,
    loadingId: null,
};

const librarySlice = createSlice({
    name: 'library',
    initialState,
    reducers: {
        loading(state: LibraryState) {
            state.status = 'loading';
            state.error = null;
        },
        setItems(state: LibraryState, action: PayloadAction<LibraryItem[]>) {
            state.items = action.payload;
            state.status = 'ready';
        },
        failed(state: LibraryState, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
        setRights(state: LibraryState, action: PayloadAction<LibraryRights>) {
            state.rights = action.payload;
        },
        itemUpserted(state: LibraryState, action: PayloadAction<LibraryItem>) {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index === -1) state.items.unshift(action.payload);
            else state.items[index] = action.payload;
        },
        itemRemoved(state: LibraryState, action: PayloadAction<number>) {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        actionStarted(state: LibraryState) {
            state.actionStatus = 'busy';
            state.actionError = null;
        },
        actionDone(state: LibraryState) {
            state.actionStatus = 'done';
        },
        actionFailed(state: LibraryState, action: PayloadAction<string>) {
            state.actionStatus = 'error';
            state.actionError = action.payload;
        },
        actionReset(state: LibraryState) {
            state.actionStatus = 'idle';
            state.actionError = null;
        },
        loadingItem(state: LibraryState, action: PayloadAction<number | null>) {
            state.loadingId = action.payload;
        },
    },
});

export const libraryActions = librarySlice.actions;
export const libraryReducer = librarySlice.reducer;

interface WithLibrary {
    library: LibraryState;
}

export const selectLibraryItems = (state: WithLibrary) => state.library.items;
export const selectLibraryStatus = (state: WithLibrary) => state.library.status;
export const selectLibraryRights = (state: WithLibrary) => state.library.rights;
