import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BitrixAppDto } from "@workspace/nest-api";

export interface BitrixAppState {
    bxApps: BitrixAppDto[];
    selectedBxApp: BitrixAppDto | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: BitrixAppState = {
    bxApps: [],
    selectedBxApp: null,
    isLoading: false,
    error: null,
};

const bxAppSlice = createSlice({
    name: 'bxApp',
    initialState,
    reducers: {
        setBxApps: (state: BitrixAppState, action: PayloadAction<BitrixAppDto[]>) => {
            state.bxApps = action.payload;
        },
        addBxApp: (state: BitrixAppState, action: PayloadAction<BitrixAppDto>) => {
            state.bxApps.push(action.payload);
        },
        updateBxApp: (state: BitrixAppState, action: PayloadAction<BitrixAppDto>) => {
            const index = state.bxApps.findIndex(app => app.id === action.payload.id);
            if (index !== -1) {
                state.bxApps[index] = action.payload;
            }
        },
        removeBxApp: (state: BitrixAppState, action: PayloadAction<number>) => {
            state.bxApps = state.bxApps.filter(app => app.id !== action.payload.toString());
        },
        setSelectedBxApp: (state: BitrixAppState, action: PayloadAction<{ id: number }>) => {


            state.selectedBxApp = state.bxApps.find(app => app.id === action.payload?.id.toString()) ?? null;

        },
        clearError: (state: BitrixAppState) => {
            state.error = null;
        },
        clear: (state: BitrixAppState) => {
            state.bxApps = [];
            state.selectedBxApp = null;
            state.error = null;
            state.isLoading = false;
        },
    },
});


export const bxAppReducer = bxAppSlice.reducer;
export const bxAppActions = bxAppSlice.actions;


