import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ZakupkiProviderKey, ZakupkiSettings } from './dto';

export type ZakupkiStatus = 'idle' | 'loading' | 'ready' | 'error';
export type ZakupkiGenerateStatus = 'idle' | 'generating' | 'done' | 'error';

export interface ZakupkiState {
    status: ZakupkiStatus;
    error: string | null;
    /** Действующие настройки (свои или портала) */
    settings: ZakupkiSettings | null;
    /** Правка полей: код → значение; пусто — ничего не меняли */
    draft: Record<string, string>;
    isEditing: boolean;
    isSaving: boolean;
    saveError: string | null;
    generate: { status: ZakupkiGenerateStatus; error: string | null; operationId: string | null };
}

const initialState: ZakupkiState = {
    status: 'idle',
    error: null,
    settings: null,
    draft: {},
    isEditing: false,
    isSaving: false,
    saveError: null,
    generate: { status: 'idle', error: null, operationId: null },
};

export const zakupkiSlice = createSlice({
    name: 'zakupki',
    initialState,
    reducers: {
        loading(state: ZakupkiState) {
            state.status = 'loading';
            state.error = null;
        },
        loaded(state: ZakupkiState, action: PayloadAction<ZakupkiSettings>) {
            state.settings = action.payload;
            state.status = 'ready';
            state.draft = {};
            state.isEditing = false;
            state.isSaving = false;
            state.saveError = null;
        },
        failed(state: ZakupkiState, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
            state.isSaving = false;
        },
        setEditing(state: ZakupkiState, action: PayloadAction<boolean>) {
            state.isEditing = action.payload;
            if (!action.payload) state.draft = {};
            state.saveError = null;
        },
        setDraftValue(state: ZakupkiState, action: PayloadAction<{ code: string; value: string }>) {
            state.draft[action.payload.code] = action.payload.value;
        },
        saving(state: ZakupkiState, action: PayloadAction<boolean>) {
            state.isSaving = action.payload;
            if (action.payload) state.saveError = null;
        },
        saveFailed(state: ZakupkiState, action: PayloadAction<string>) {
            state.isSaving = false;
            state.saveError = action.payload;
        },
        generateStarted(state: ZakupkiState) {
            state.generate = { status: 'generating', error: null, operationId: null };
        },
        generateDone(state: ZakupkiState, action: PayloadAction<string | null>) {
            state.generate = { status: 'done', error: null, operationId: action.payload };
        },
        generateFailed(state: ZakupkiState, action: PayloadAction<string>) {
            state.generate = { status: 'error', error: action.payload, operationId: null };
        },
        reset() {
            return initialState;
        },
    },
});

export const zakupkiActions = zakupkiSlice.actions;
export const zakupkiReducer = zakupkiSlice.reducer;

interface WithZakupki {
    zakupki: ZakupkiState;
}

export const selectZakupkiState = (state: WithZakupki) => state.zakupki;
export const selectZakupkiSettings = (state: WithZakupki) => state.zakupki.settings;

/** Поля поставщика с учётом правок (черновик сильнее сохранённого). */
export const selectZakupkiProviderFields = (state: WithZakupki, provider: ZakupkiProviderKey) =>
    (state.zakupki.settings?.providers[provider] ?? []).map(field =>
        field.code in state.zakupki.draft ? { ...field, value: state.zakupki.draft[field.code] ?? null } : field,
    );
