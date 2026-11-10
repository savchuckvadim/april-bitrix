import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DealSendWarning } from '../lib/deal-send-warnings.util';

export type DealSendStatus = 'idle' | 'sending' | 'done' | 'error';

export interface DealSendState {
    status: DealSendStatus;
    error: string | null;
    /** Последняя отправка: куда ушло и что не записалось в сделку */
    lastDealId: number | null;
    lastCreated: boolean;
    warnings: DealSendWarning[];
}

const initialState: DealSendState = {
    status: 'idle',
    error: null,
    lastDealId: null,
    lastCreated: false,
    warnings: [],
};

const dealSendSlice = createSlice({
    name: 'dealSend',
    initialState,
    reducers: {
        started(state: DealSendState) {
            state.status = 'sending';
            state.error = null;
            state.warnings = [];
        },
        done(
            state: DealSendState,
            action: PayloadAction<{ dealId: number; created: boolean; warnings: DealSendWarning[] }>,
        ) {
            state.status = 'done';
            state.lastDealId = action.payload.dealId;
            state.lastCreated = action.payload.created;
            state.warnings = action.payload.warnings;
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
