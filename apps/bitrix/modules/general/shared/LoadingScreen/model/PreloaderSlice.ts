import { PayloadAction, createSlice } from "@reduxjs/toolkit";


//TYPES
export type PreloaderState = typeof initialState



const initialState = {

    status: false as boolean,


}


const preloaderSlice = createSlice({
    name: 'preloader',
    initialState,
    reducers: {


        set: (
            state: PreloaderState,
            action: PayloadAction<{ status: boolean }>
        ) => {
            state.status = action.payload.status

        },




    },



});




//utils


export const preloaderReducer = preloaderSlice.reducer;

// Экспорт actions
export const preloaderActions = preloaderSlice.actions;