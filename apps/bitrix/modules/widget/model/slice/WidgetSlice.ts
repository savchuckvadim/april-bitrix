import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { WidgetState, BitrixPlacement, BitrixSetting } from '../types';

const initialState: WidgetState = {
    placements: [],
    isLoading: false,
    error: null,
    installationProgress: 0,
};

const widgetSlice = createSlice({
    name: 'widget',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setPlacements: (state, action: PayloadAction<BitrixPlacement[]>) => {
            state.placements = action.payload;
            // Пересчитываем прогресс установки
            const installed = action.payload.filter(p => p.status === 'installed').length;
            state.installationProgress = action.payload.length > 0 ? (installed / action.payload.length) * 100 : 0;
        },
        addPlacement: (state, action: PayloadAction<BitrixPlacement>) => {
            state.placements.push(action.payload);
            // Пересчитываем прогресс установки
            const installed = state.placements.filter(p => p.status === 'installed').length;
            state.installationProgress = state.placements.length > 0 ? (installed / state.placements.length) * 100 : 0;
        },
        updatePlacement: (state, action: PayloadAction<BitrixPlacement>) => {
            const index = state.placements.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.placements[index] = action.payload;
                // Пересчитываем прогресс установки
                const installed = state.placements.filter(p => p.status === 'installed').length;
                state.installationProgress = state.placements.length > 0 ? (installed / state.placements.length) * 100 : 0;
            }
        },
        removePlacement: (state, action: PayloadAction<bigint>) => {
            state.placements = state.placements.filter(p => p.id !== action.payload);
            // Пересчитываем прогресс установки
            const installed = state.placements.filter(p => p.status === 'installed').length;
            state.installationProgress = state.placements.length > 0 ? (installed / state.placements.length) * 100 : 0;
        },
        updatePlacementStatus: (state, action: PayloadAction<{ id: bigint; status: 'not_installed' | 'installing' | 'installed' | 'error' }>) => {
            const placement = state.placements.find(p => p.id === action.payload.id);
            if (placement) {
                placement.status = action.payload.status;
                // Пересчитываем прогресс установки
                const installed = state.placements.filter(p => p.status === 'installed').length;
                state.installationProgress = state.placements.length > 0 ? (installed / state.placements.length) * 100 : 0;
            }
        },
        updatePlacementSettings: (state, action: PayloadAction<{ id: bigint; settings: BitrixSetting[] }>) => {
            const placement = state.placements.find(p => p.id === action.payload.id);
            if (placement) {
                placement.settings = action.payload.settings;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const widgetReducer = widgetSlice.reducer;
export const widgetActions = widgetSlice.actions as any;
