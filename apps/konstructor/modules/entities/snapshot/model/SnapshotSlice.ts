import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Состояние восстановления слепка сделки («вспоминание»).
 * idle → loading → restored | none | error.
 * none = слепка нет (нормальный флоу новой сделки), error — не блокирует.
 */
export type SnapshotStatus = 'idle' | 'loading' | 'restored' | 'none' | 'error';
export type SnapshotSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SnapshotState {
    status: SnapshotStatus;
    /** Ворнинги маппинга v1→v2 + битые поля parse-v1 (не блокируют) */
    warnings: string[];
    /** Word-шаблон из слепка (легаси читал, но не писал — чиним асимметрию) */
    templateId: number | null;
    error: string | null;
    /** Сохранение слепка v2 (POST upsert) */
    saveStatus: SnapshotSaveStatus;
    saveError: string | null;
}

const initialState: SnapshotState = {
    status: 'idle',
    warnings: [],
    templateId: null,
    error: null,
    saveStatus: 'idle',
    saveError: null,
};

const snapshotSlice = createSlice({
    name: 'snapshot',
    initialState,
    reducers: {
        started(state) {
            state.status = 'loading';
            state.error = null;
        },
        restored(
            state,
            action: PayloadAction<{
                warnings: string[];
                templateId: number | null;
            }>,
        ) {
            state.status = 'restored';
            state.warnings = action.payload.warnings;
            state.templateId = action.payload.templateId;
        },
        none(state) {
            state.status = 'none';
        },
        failed(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
        saveStarted(state) {
            state.saveStatus = 'saving';
            state.saveError = null;
        },
        saveDone(state) {
            state.saveStatus = 'saved';
        },
        saveFailed(state, action: PayloadAction<string>) {
            state.saveStatus = 'error';
            state.saveError = action.payload;
        },
        saveReset(state) {
            state.saveStatus = 'idle';
            state.saveError = null;
        },
        reset() {
            return initialState;
        },
    },
});

// Деструктуризация вместо экспорта slice.actions целиком — обход TS2742
const {
    started,
    restored,
    none,
    failed,
    saveStarted,
    saveDone,
    saveFailed,
    saveReset,
    reset,
} = snapshotSlice.actions;
export const snapshotActions = {
    started,
    restored,
    none,
    failed,
    saveStarted,
    saveDone,
    saveFailed,
    saveReset,
    reset,
};
export const snapshotReducer = snapshotSlice.reducer;

interface WithSnapshot {
    snapshot: SnapshotState;
}

export const selectSnapshotStatus = (state: WithSnapshot) =>
    state.snapshot.status;
export const selectSnapshotWarnings = (state: WithSnapshot) =>
    state.snapshot.warnings;
export const selectSnapshotTemplateId = (state: WithSnapshot) =>
    state.snapshot.templateId;
export const selectSnapshotRestored = (state: WithSnapshot) =>
    state.snapshot.status === 'restored';
export const selectSnapshotSaveStatus = (state: WithSnapshot) =>
    state.snapshot.saveStatus;
export const selectSnapshotSaveError = (state: WithSnapshot) =>
    state.snapshot.saveError;
