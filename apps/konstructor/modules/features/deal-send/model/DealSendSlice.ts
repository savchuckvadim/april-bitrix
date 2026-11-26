import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DealSendWarning } from '../lib/deal-send-warnings.util';

export type DealSendStatus = 'idle' | 'sending' | 'done' | 'error';

/** Что делает отправка: ждёт ответ бэка или ждёт, пока запись дойдёт до сделки. */
export type DealSendPhase = 'request' | 'write';

export interface DealSendState {
    status: DealSendStatus;
    phase: DealSendPhase | null;
    error: string | null;
    /**
     * Ключ незавершённой попытки создать сделку. Остаётся после сбоя, чтобы
     * повтор не завёл вторую сделку; сбрасывается, когда сделка создана.
     */
    requestKey: string | null;
    /** Последняя отправка: куда ушло и что не записалось в сделку */
    lastDealId: number | null;
    lastCreated: boolean;
    warnings: DealSendWarning[];
}

const initialState: DealSendState = {
    status: 'idle',
    phase: null,
    error: null,
    requestKey: null,
    lastDealId: null,
    lastCreated: false,
    warnings: [],
};

const dealSendSlice = createSlice({
    name: 'dealSend',
    initialState,
    reducers: {
        started(state: DealSendState, action: PayloadAction<{ requestKey: string | null }>) {
            state.status = 'sending';
            state.phase = 'request';
            state.error = null;
            state.warnings = [];
            state.requestKey = action.payload.requestKey;
        },
        /** Сделка создана: ключ попытки отработал */
        dealCreated(state: DealSendState) {
            state.requestKey = null;
        },
        /** Бэк принял запись, ждём, когда поля и строки лягут в сделку */
        writing(state: DealSendState) {
            state.phase = 'write';
        },
        done(
            state: DealSendState,
            action: PayloadAction<{ dealId: number; created: boolean; warnings: DealSendWarning[] }>,
        ) {
            state.status = 'done';
            state.phase = null;
            state.lastDealId = action.payload.dealId;
            state.lastCreated = action.payload.created;
            state.warnings = action.payload.warnings;
        },
        failed(state: DealSendState, action: PayloadAction<string>) {
            state.status = 'error';
            state.phase = null;
            state.error = action.payload;
        },
        reset(state: DealSendState) {
            state.status = 'idle';
            state.phase = null;
            state.error = null;
        },
    },
});

export const dealSendActions = dealSendSlice.actions;
export const dealSendReducer = dealSendSlice.reducer;
