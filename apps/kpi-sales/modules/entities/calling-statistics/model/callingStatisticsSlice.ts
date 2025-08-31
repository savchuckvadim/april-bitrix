import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReportCallingData } from '../type/calling-type';

export type CallingStatisticsState = typeof initialState;

const initialState = {
    items: null as ReportCallingData[] | null,
    isFetched: false,
    isLoading: false as boolean,
};

const callingStatisticsSlice = createSlice({
    name: 'callingStatistics',
    initialState,
    reducers: {
        setLoading: (
            state: CallingStatisticsState,
            action: PayloadAction<boolean>,
        ) => {
            state.isLoading = action.payload;
        },
        setFetched: (
            state: CallingStatisticsState,
            action: PayloadAction<ReportCallingData[] | null>,
        ) => {
            state.items = action.payload;
            state.isFetched = true;
        },
    },
});

export const callingStatisticsActions = callingStatisticsSlice.actions;
export default callingStatisticsSlice.reducer;
