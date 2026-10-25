import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type DealSendStatus = 'idle' | 'sending' | 'done' | 'error';

export interface DealSendState {
    status: DealSendStatus;
    error: string | null;
    /** Последняя отправка: куда ушло и что бэк не записал */
    lastDealId: number | null;
    lastCreated: boolean;
    skipped: string[];
}

const initialState: DealSendState = {
    status: 'idle',
    error: null,
    lastDealId: null,
    lastCreated: false,
    skipped: [],
};

const dealSendSlice = createSlice({
    name: 'dealSend',
    initialState,
    reducers: {
        started(state: DealSendState) {
            state.status = 'sending';
            state.error = null;
            state.skipped = [];
        },
        done(
            state: DealSendState,
            action: PayloadAction<{ dealId: number; created: boolean; skipped: string[] }>,
        ) {
            state.status = 'done';
            state.lastDealId = action.payload.dealId;
            state.lastCreated = action.payload.created;
            state.skipped = action.payload.skipped;
        },
        failed(state: DealSendState, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
        reset(state: DealSendState) {
            state.status = 'idle';
            state.error = null;
        },
    },
});

export const dealSendActions = dealSendSlice.actions;
export const dealSendReducer = dealSendSlice.reducer;
