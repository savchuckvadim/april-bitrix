import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { SectionStatus } from '@/modules/shared/SectionState';
import type { HistoryEntry } from '../lib/history-list';

export type EVHistoryItem = HistoryEntry;

export interface EVHistoryState {
    items: EVHistoryItem[];
    status: SectionStatus;
    /** Смещение следующей страницы; `null` — всё загружено. */
    next: number | null;
    /** Сколько всего записей, если портал сказал. */
    total: number | null;
    /** Списка нет на портале — история недоступна, и это не ошибка. */
    isListMissing: boolean;
}

const initialState: EVHistoryState = {
    items: [],
    status: 'idle',
    next: null,
    total: null,
    isListMissing: false,
};

const eventHistorySlice = createSlice({
    name: 'eventHistory',
    initialState,
    reducers: {
        setLoading: (state: EVHistoryState) => {
            state.status = 'loading';
        },
        /**
         * Страница истории. `reset` отличает первую загрузку от догрузки:
         * при первой список заменяем, при догрузке — дописываем.
         */
        setPage: (
            state: EVHistoryState,
            action: PayloadAction<{
                items: EVHistoryItem[];
                next: number | null;
                total: number | null;
                reset: boolean;
            }>,
        ) => {
            const { items, next, total, reset } = action.payload;
            state.items = reset ? items : [...state.items, ...items];
            state.next = next;
            state.total = total;
            state.status = 'ready';
            state.isListMissing = false;
        },
        setError: (state: EVHistoryState) => {
            state.status = 'error';
        },
        setListMissing: (state: EVHistoryState) => {
            state.status = 'ready';
            state.isListMissing = true;
            state.items = [];
            state.next = null;
        },
        reset: () => initialState,
    },
});

export const eventHistoryReducer = eventHistorySlice.reducer;
export const eventHistoryActions = eventHistorySlice.actions;
