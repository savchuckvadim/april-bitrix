import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type EVPostFailState = typeof initialState;

/** Дата следующего звонка после «Отказа» (гейт withPostFail по домену). */
export const initialState = {
    isActive: false as boolean,
    isChanged: false as boolean,
    postFailDate: '' as string,
};

const eventPostFailSlice = createSlice({
    name: 'eventPostFail',
    initialState,
    reducers: {
        setIsActive: (
            state: EVPostFailState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isActive = action.payload.status;
        },
        setIsChanged: (
            state: EVPostFailState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isChanged = action.payload.status;
        },
        setPostFailDate: (
            state: EVPostFailState,
            action: PayloadAction<{ date: string }>,
        ) => {
            state.postFailDate = action.payload.date;
        },
        clean: (state: EVPostFailState) => {
            state.isChanged = false;
            state.isActive = false;
            state.postFailDate = '';
        },
    },
});

export const eventPostFailReducer = eventPostFailSlice.reducer;
export const eventPostFailActions = eventPostFailSlice.actions;
