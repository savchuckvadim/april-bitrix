import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    DEFAULT_KONSTRUCTOR_APP_CONFIG,
    type AppSettingsStatus,
    type KonstructorAppConfig,
} from './types';

export interface AppSettingsState {
    config: KonstructorAppConfig;
    status: AppSettingsStatus;
    error: string | null;
}

const initialState: AppSettingsState = {
    config: DEFAULT_KONSTRUCTOR_APP_CONFIG,
    status: 'idle',
    error: null,
};

export const appSettingsSlice = createSlice({
    name: 'appSettings',
    initialState,
    reducers: {
        loading(state: AppSettingsState) {
            state.status = 'loading';
            state.error = null;
        },
        loaded(state: AppSettingsState, action: PayloadAction<KonstructorAppConfig>) {
            state.config = action.payload;
            state.status = 'ready';
        },
        /** Сеть упала и кэша нет — остаёмся на дефолтах реестра, экран работает как раньше */
        failed(state: AppSettingsState, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
    },
});

export const appSettingsActions = appSettingsSlice.actions;
export const appSettingsReducer = appSettingsSlice.reducer;

interface WithAppSettings {
    appSettings: AppSettingsState;
}

export const selectAppConfig = (state: WithAppSettings) => state.appSettings.config;
export const selectZakupkiEnabled = (state: WithAppSettings) => state.appSettings.config.zakupkiEnabled;
