import { createSlice } from '@reduxjs/toolkit';
import {
    Complect,
    ComplectFullTitlesEnum,
    ComplectNamesEnum,
    ComplectShortitlesEnum,
} from '../type/document-complect-type';

//TYPES
export type ComplectCurrentPlanState = typeof initialState;

export const initialState = null as null | Complect;

const complectCurrentSlice = createSlice({
    name: 'complectCurrent',
    initialState,
    reducers: {},
});

export const complectCurrentReducer = complectCurrentSlice.reducer;

// Экспорт actions
export const complectCurrentActions = complectCurrentSlice.actions;
