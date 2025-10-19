import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PortalState, Portal, BitrixApp } from '../types';

const initialState: PortalState = {
    portals: [],
    selectedPortal: null,
    isLoading: false,
    error: null,
};

const portalSlice = createSlice({
    name: 'portal',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setPortals: (state, action: PayloadAction<Portal[]>) => {
            state.portals = action.payload;
        },
        addPortal: (state, action: PayloadAction<Portal>) => {
            state.portals.push(action.payload);
        },
        updatePortal: (state, action: PayloadAction<Portal>) => {
            const index = state.portals.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.portals[index] = action.payload;
            }
        },
        removePortal: (state, action: PayloadAction<bigint>) => {
            state.portals = state.portals.filter(p => p.id !== action.payload);
        },
        setSelectedPortal: (state, action: PayloadAction<Portal | null>) => {
            state.selectedPortal = action.payload;
        },
        addAppToPortal: (state, action: PayloadAction<{ portalId: bigint; app: BitrixApp }>) => {
            const portal = state.portals.find(p => p.id === action.payload.portalId);
            if (portal) {
                portal.bitrixApps.push(action.payload.app);
            }
        },
        updateAppInPortal: (state, action: PayloadAction<{ portalId: bigint; app: BitrixApp }>) => {
            const portal = state.portals.find(p => p.id === action.payload.portalId);
            if (portal) {
                const index = portal.bitrixApps.findIndex(a => a.id === action.payload.app.id);
                if (index !== -1) {
                    portal.bitrixApps[index] = action.payload.app;
                }
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const portalReducer = portalSlice.reducer;
export const portalActions = portalSlice.actions as any;
