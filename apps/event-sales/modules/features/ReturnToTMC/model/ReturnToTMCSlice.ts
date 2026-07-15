import { BXDeal } from '@workspace/bx';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** ТМЦ-сделка для возврата презентационной задачи в отдел ТМЦ. */
export type TmcDealsForReturn = {
    taskId: number;
    tmcDeal: BXDeal;
    presDeal?: BXDeal;
};

const initialState = {
    menu: {
        isActive: false,
    },
    isFetched: false,
    isLoading: false,
    isDone: false,
    tmcDeals: [] as TmcDealsForReturn[],
};

export type EVReturnToTmcState = typeof initialState;

const returnToTmcSlice = createSlice({
    name: 'returnToTmc',
    initialState,
    reducers: {
        init: (
            state: EVReturnToTmcState,
            action: PayloadAction<{ tmcDeals: TmcDealsForReturn[] }>,
        ) => {
            state.tmcDeals = action.payload.tmcDeals;
            state.isLoading = false;
            state.isFetched = true;
            state.isDone = false;
        },
        setLoadingStatus: (
            state: EVReturnToTmcState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },
        setActiveStatus: (
            state: EVReturnToTmcState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.menu.isActive = action.payload.status;
        },
        clean: (state: EVReturnToTmcState) => {
            state.isLoading = false;
            state.isFetched = false;
            state.isDone = false;
            state.menu.isActive = false;
            state.tmcDeals = [];
        },
    },
});

export const returnToTmcReducer = returnToTmcSlice.reducer;
export const returnToTmcActions = returnToTmcSlice.actions;
