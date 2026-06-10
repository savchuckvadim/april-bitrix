import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Portal } from '../type/portal.type';
import { initPortal } from './PortalThunk';

export interface PortalState {
    current: Portal | null;
    isFetched: boolean;
    error: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: PortalState = {
    current: null,
    isFetched: false,
    error: null,
    status: 'idle',
};

export const portalSlice = createSlice({
    name: 'portal',
    initialState,
    reducers: {
        setPortal: (state: PortalState, action: PayloadAction<Portal | null>) => {
            state.current = action.payload;
            state.isFetched = true;
            state.error = null;
            state.status = 'succeeded';
        },
        resetPortal: (state: PortalState) => {
            state.current = null;
            state.isFetched = false;
            state.error = null;
            state.status = 'idle';
        },
    },
    extraReducers: builder => {
        builder
            .addCase(initPortal.pending, (state: PortalState) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(initPortal.fulfilled, (state: PortalState, action: PayloadAction<Portal | null>) => {
                state.current = action.payload;
                state.isFetched = true;
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(initPortal.rejected, (state: PortalState, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload ?? 'Portal init failed';
                state.isFetched = false;
            });
    },
});

export const { setPortal, resetPortal } = portalSlice.actions;
export const portalReducer = portalSlice.reducer;
