import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AirtimeReport } from './index';

export type AirtimeStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AirtimeSection {
    status: AirtimeStatus;
    data: AirtimeReport | null;
    /** `${dateFrom}|${dateTo}|${sortedUserIds}` — что загружено/грузится. */
    requestKey: string | null;
    error: string | null;
}

export interface AirtimeState {
    /** Команда (виджет в отчёте). */
    team: AirtimeSection;
    /** Один сотрудник (карточка в user report). */
    user: AirtimeSection & { userId: number | null };
}

const emptySection = (): AirtimeSection => ({
    status: 'idle',
    data: null,
    requestKey: null,
    error: null,
});

const initialState: AirtimeState = {
    team: emptySection(),
    user: { ...emptySection(), userId: null },
};

const airtimeSlice = createSlice({
    name: 'airtime',
    initialState,
    reducers: {
        teamPending: (
            state: AirtimeState,
            action: PayloadAction<{ requestKey: string }>,
        ) => {
            state.team.status = 'loading';
            state.team.requestKey = action.payload.requestKey;
            state.team.error = null;
        },
        teamReady: (
            state: AirtimeState,
            action: PayloadAction<AirtimeReport>,
        ) => {
            state.team.status = 'ready';
            state.team.data = action.payload;
        },
        teamFailed: (state: AirtimeState, action: PayloadAction<string>) => {
            state.team.status = 'error';
            state.team.error = action.payload;
        },
        userPending: (
            state: AirtimeState,
            action: PayloadAction<{ requestKey: string; userId: number }>,
        ) => {
            state.user.status = 'loading';
            state.user.requestKey = action.payload.requestKey;
            state.user.userId = action.payload.userId;
            state.user.error = null;
        },
        userReady: (
            state: AirtimeState,
            action: PayloadAction<AirtimeReport>,
        ) => {
            state.user.status = 'ready';
            state.user.data = action.payload;
        },
        userFailed: (state: AirtimeState, action: PayloadAction<string>) => {
            state.user.status = 'error';
            state.user.error = action.payload;
        },
    },
});

export const airtimeReducer = airtimeSlice.reducer;
export const airtimeActions = airtimeSlice.actions;
