import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EVCallingRecord } from './index';

export type EVCallingRecordState = typeof initialState;

const initialState = {
    items: [] as EVCallingRecord[],
    isShowing: false as boolean,
    isFetched: false as boolean,
    isLoading: false as boolean,
};

const eventCallingRecordSlice = createSlice({
    name: 'eventCallingRecord',
    initialState,
    reducers: {
        setFiles: (
            state: EVCallingRecordState,
            action: PayloadAction<{ records: EVCallingRecord[] | null }>,
        ) => {
            state.items = action.payload.records ?? [];
            state.isFetched = true;
            state.isLoading = false;
        },
        setLoadingStatus: (
            state: EVCallingRecordState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },
        setShowStatus: (
            state: EVCallingRecordState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isShowing = action.payload.status;
        },
        /** играет только одна запись: остальным сбрасывается isPlaying */
        setPlayingStatus: (
            state: EVCallingRecordState,
            action: PayloadAction<{ fileId: number; status: boolean }>,
        ) => {
            state.items = state.items.map(item =>
                item.id === action.payload.fileId
                    ? { ...item, isPlaying: action.payload.status }
                    : { ...item, isPlaying: false },
            );
        },
        clean: (state: EVCallingRecordState) => {
            state.items = [];
            state.isFetched = false;
            state.isLoading = false;
            state.isShowing = false;
        },
    },
});

export const eventCallingRecordReducer = eventCallingRecordSlice.reducer;
export const eventCallingRecordActions = eventCallingRecordSlice.actions;
