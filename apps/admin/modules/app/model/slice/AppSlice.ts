import { PayloadAction, createSlice } from "@reduxjs/toolkit"



export type AppState = typeof initialState
export enum APP_DEP {
    SALES = 'sales',
    SERVICE = 'service',
}
const initialState = {
    domain: '',
    app: 'admin',
   
    initialized: false,
    isLoading: false,
    error: {
        status: false as boolean,
        message: '' as string
    },


}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        isLoading: (
            state: AppState,
            action: PayloadAction<
                {
                    status: boolean

                }
            >
        ) => {

            state.isLoading = action.payload.status;
        },
      
        setInitializedSuccess: (
            state: AppState,
            action: PayloadAction<{}>
        ) => {
            state.initialized = true
        },
        setInitializedError: (
            state: AppState,
            action: PayloadAction<{
                errorMessage: string
            }>
        ) => {

            state.initialized = true
            state.error.status = true
            state.error.message = action.payload.errorMessage
        },
        setCleanError: (
            state: AppState,
            action: PayloadAction<{
                errorMessage: string
            }>
        ) => {

            state.error.status = false
            state.error.message = ''
        },

        reload: (
            state: AppState,
            action: PayloadAction

        ) => {
            state.initialized = false
        }
    },

});

export const appReducer = appSlice.reducer;

// Экспорт actions
export const appActions = appSlice.actions;
