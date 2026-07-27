import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserAward } from '../lib/build-awards.util';

export interface ReportAwardsState {
    /** Награды по id пользователя (пусто — наград нет). */
    byUserId: Record<number, UserAward>;
}

const initialState: ReportAwardsState = { byUserId: {} };

/**
 * Награды пользователей, пересчитываемые листенером из данных других
 * отчётов (report/callings/конверсии). UI (user-report) только читает.
 */
const reportAwardsSlice = createSlice({
    name: 'reportAwards',
    initialState,
    reducers: {
        setAwards: (
            state: ReportAwardsState,
            action: PayloadAction<Record<number, UserAward>>,
        ) => {
            state.byUserId = action.payload;
        },
    },
});

export const reportAwardsReducer = reportAwardsSlice.reducer;
export const reportAwardsActions = reportAwardsSlice.actions;
