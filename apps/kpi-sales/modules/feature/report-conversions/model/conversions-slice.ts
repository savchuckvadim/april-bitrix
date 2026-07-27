import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_CONVERSION_CHAIN } from '../lib/conversion-catalog';
import type {
    ConversionScope,
    ConversionsState,
    ConversionTableConfig,
    ConversionWidgetConfig,
    PersistedConversions,
} from './conversion.types';

const defaultTableConfig = (): ConversionTableConfig => ({
    method: 'chain',
    codes: [...DEFAULT_CONVERSION_CHAIN],
    enabled: false,
    settingsOpen: false,
});

const defaultWidgetConfig = (): ConversionWidgetConfig => ({
    method: 'chain',
    codes: [...DEFAULT_CONVERSION_CHAIN],
});

const initialState: ConversionsState = {
    version: 1,
    hydrated: false,
    table: {
        kpi: defaultTableConfig(),
        callings: defaultTableConfig(),
        merged: defaultTableConfig(),
    },
    widget: {
        kpi: defaultWidgetConfig(),
        callings: defaultWidgetConfig(),
        merged: defaultWidgetConfig(),
    },
    tab: {
        method: 'chain',
        codes: [...DEFAULT_CONVERSION_CHAIN],
    },
};

const conversionsSlice = createSlice({
    name: 'conversions',
    initialState,
    reducers: {
        setTableConfig: (
            state: ConversionsState,
            action: PayloadAction<{
                scope: ConversionScope;
                patch: Partial<ConversionTableConfig>;
            }>,
        ) => {
            Object.assign(
                state.table[action.payload.scope],
                action.payload.patch,
            );
        },
        setWidgetConfig: (
            state: ConversionsState,
            action: PayloadAction<{
                scope: ConversionScope;
                patch: Partial<ConversionWidgetConfig>;
            }>,
        ) => {
            Object.assign(
                state.widget[action.payload.scope],
                action.payload.patch,
            );
        },
        setTabConfig: (
            state: ConversionsState,
            action: PayloadAction<Partial<ConversionsState['tab']>>,
        ) => {
            Object.assign(state.tab, action.payload);
        },
        hydrate: (
            state: ConversionsState,
            action: PayloadAction<PersistedConversions | null>,
        ) => {
            const stored = action.payload;
            if (stored) {
                state.table = { ...state.table, ...stored.table };
                state.widget = { ...state.widget, ...stored.widget };
                state.tab = { ...state.tab, ...stored.tab };
            }
            state.hydrated = true;
        },
    },
});

export const conversionsReducer = conversionsSlice.reducer;
export const conversionsActions = conversionsSlice.actions;
