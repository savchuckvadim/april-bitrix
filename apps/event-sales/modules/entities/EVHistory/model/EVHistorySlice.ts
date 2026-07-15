import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface EVHistoryItem {
    id: number;
    comment: string;
}

export interface EVHistoryState {
    items: EVHistoryItem[] | null;
    isFetched: boolean;
    isLoading: boolean;
}

const initialState: EVHistoryState = {
    items: null,
    isFetched: false,
    isLoading: false,
};

const eventHistorySlice = createSlice({
    name: 'eventHistory',
    initialState,
    reducers: {
        setFetchedHistory: (
            state: EVHistoryState,
            action: PayloadAction<{ history: EVHistoryItem[] }>,
        ) => {
            state.items = action.payload.history;
            state.isFetched = true;
            state.isLoading = false;
        },
        setIsLoading: (
            state: EVHistoryState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },
    },
});

export const eventHistoryReducer = eventHistorySlice.reducer;
export const eventHistoryActions = eventHistorySlice.actions;
