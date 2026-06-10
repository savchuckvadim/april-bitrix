import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminPortalResponseDto } from "@workspace/nest-api";
import { fetchCurrentPortal } from "../thunk/curent-portal.thunk";

export interface IPortal extends AdminPortalResponseDto {}
export interface IPortalState {
    current: IPortal | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: IPortalState = {
    current: null,
    isLoading: false,
    error: null,
}

const portalSlice = createSlice({
    name: 'portal',
    initialState,
    reducers: {
        setCurrentPortal: (state:IPortalState, action: PayloadAction<IPortal>) => {
            state.current = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCurrentPortal.fulfilled, (state, action) => {
            state.current = action.payload.portal;
            state.isLoading = false;
        });
        builder.addCase(fetchCurrentPortal.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchCurrentPortal.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message ?? 'Unknown error';
        });
    },
});

export const portalReducer = portalSlice.reducer;