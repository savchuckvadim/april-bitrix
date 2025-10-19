import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type StateType = typeof initialState
const initialState = {
    inProgress: false as boolean

}

const preloaderSlice = createSlice({
    name: 'preloader',
    initialState,
    reducers: {
        setPreloader: (
            state: StateType,
            action: PayloadAction<
                {
                    status: boolean,

                }
            >
        ) => {
            const payload = action.payload;
            state.inProgress = payload.status;

        },

    },

});

export const preloaderReducer = preloaderSlice.reducer;

// Экспорт actions
export const preloaderActions = preloaderSlice.actions;