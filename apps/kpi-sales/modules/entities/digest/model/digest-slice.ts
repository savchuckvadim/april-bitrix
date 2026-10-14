import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DigestReport } from './index';
import { shiftIsoDay, todayIso } from '../lib/digest-period.util';

export type DigestStatus = 'idle' | 'loading' | 'queued' | 'ready' | 'error';

export interface DigestState {
    /** День дайджеста, YYYY-MM-DD (по умолчанию сегодня). */
    date: string;
    status: DigestStatus;
    data: DigestReport | null;
    /** `day|{date}|{date}|{sortedUserIds}` — что загружено/грузится. */
    requestKey: string | null;
    error: string | null;
    /** Сотрудник в фокусе (таймлайн/лента/сравнение); null — вся выборка. */
    focusUserId: number | null;
}

const initialState: DigestState = {
    date: todayIso(),
    status: 'idle',
    data: null,
    requestKey: null,
    error: null,
    focusUserId: null,
};

interface ArrivedPayload {
    requestKey: string;
    data: DigestReport;
}

interface FailedPayload {
    requestKey?: string;
    message: string;
}

const digestSlice = createSlice({
    name: 'digest',
    initialState,
    reducers: {
        setDate: (state: DigestState, action: PayloadAction<string>) => {
            state.date = action.payload;
        },
        shiftDay: (state: DigestState, action: PayloadAction<number>) => {
            state.date = shiftIsoDay(state.date, action.payload);
        },
        setFocusUser: (state: DigestState, action: PayloadAction<number | null>) => {
            state.focusUserId =
                state.focusUserId === action.payload ? null : action.payload;
        },
        pending: (state: DigestState, action: PayloadAction<{ requestKey: string }>) => {
            // Смена дня/выборки — старые данные под стеклом вводили бы в
            // заблуждение; тот же ключ (ретрай/forceRefresh) — оставляем.
            if (state.requestKey !== action.payload.requestKey) {
                state.data = null;
            }
            state.status = 'loading';
            state.requestKey = action.payload.requestKey;
            state.error = null;
        },
        queued: (state: DigestState, action: PayloadAction<{ requestKey: string }>) => {
            if (state.requestKey !== action.payload.requestKey) return;
            state.status = 'queued';
            state.error = null;
        },
        arrived: (state: DigestState, action: PayloadAction<ArrivedPayload>) => {
            if (state.requestKey !== action.payload.requestKey) return;
            state.status = 'ready';
            state.data = action.payload.data;
            state.error = null;
        },
        failed: (state: DigestState, action: PayloadAction<FailedPayload>) => {
            if (
                action.payload.requestKey &&
                state.requestKey !== action.payload.requestKey
            ) {
                return;
            }
            state.status = 'error';
            state.error = action.payload.message;
        },
    },
});

export const digestReducer = digestSlice.reducer;
export const digestActions = digestSlice.actions;
