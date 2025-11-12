import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MergedReportState {
    selectedUsers: number[];
    selectedActions: string[];
}
const initialState: MergedReportState = {
    selectedUsers: [] as number[],
    selectedActions: [] as string[],
}

const mergedReportSlice = createSlice({
    name: 'mergedReport',
    initialState,
    reducers: {
        setSelectedUsers: (
            state: MergedReportState,
            action: PayloadAction<number[]>
        ) => {
            state.selectedUsers = action.payload;
        },
        setSelectedActions: (
            state: MergedReportState,
            action: PayloadAction<string[]>
        ) => {
            state.selectedActions = action.payload;
        },
    },
});

export const mergedReportActions = mergedReportSlice.actions;
export const mergedReportReducer = mergedReportSlice.reducer;
