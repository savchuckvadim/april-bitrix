import { PayloadAction, createSlice } from '@reduxjs/toolkit';

/** Счётчики результатов звонков пользователя по компании. */
export interface CallResults {
    noresultCount: number;
    resultCount: number;
    presentationCount: number;
    inProgressCount: number;
    inMoneyCount: number;
}

const initialState = {
    results: {
        noresultCount: 0,
        resultCount: 0,
        presentationCount: 0,
        inProgressCount: 0,
        inMoneyCount: 0,
    } as CallResults,
    menu: {
        isActive: false,
    },
    isFetched: false,
    isLoading: false,
    isDone: false,
    sendedTaskIds: [] as number[],
};

export type EVNoCallState = typeof initialState;

const noCallSlice = createSlice({
    name: 'noCall',
    initialState,
    reducers: {
        setFetched: (
            state: EVNoCallState,
            action: PayloadAction<{ results: CallResults | null }>,
        ) => {
            state.isDone = !!action.payload.results;
            state.isFetched = true;
            state.isLoading = false;
            if (action.payload.results) {
                state.results = action.payload.results;
            }
        },
        setLoadingStatus: (
            state: EVNoCallState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },
        setActiveStatus: (
            state: EVNoCallState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.menu.isActive = action.payload.status;
        },
        setSendedTaskId: (
            state: EVNoCallState,
            action: PayloadAction<{ taskId: number }>,
        ) => {
            state.sendedTaskIds.push(action.payload.taskId);
            state.results.noresultCount += 1;
        },
    },
});

export const noCallReducer = noCallSlice.reducer;
export const noCallActions = noCallSlice.actions;
