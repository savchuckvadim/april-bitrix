import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PbxFieldMeta } from './index';
import type { PbxEditKey } from '../lib/edit-key.util';
import type { PbxEditStatus } from '../lib/pbx-fields.data';

export type PbxMetaStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Optimistic-значение поверх server-значения из DTO отчётов. */
export interface PbxFieldOverride {
    value: string | null;
}

/** Статус текущего сейва поля (микро-бейдж в месте редактирования). */
export interface PbxFieldEditState {
    status: PbxEditStatus;
    /** Текст ошибки для тултипа (только при status='error'). */
    message?: string;
}

export interface PbxFieldsState {
    meta: {
        status: PbxMetaStatus;
        /** Метаданные полей по коду. */
        byCode: Record<string, PbxFieldMeta>;
    };
    /** Optimistic-значения: editKey → значение (перекрывает DTO отчёта). */
    overrides: Record<string, PbxFieldOverride>;
    /** Статусы сейвов: editKey → {saving|saved|error}. */
    edits: Record<string, PbxFieldEditState>;
}

const initialState: PbxFieldsState = {
    meta: { status: 'idle', byCode: {} },
    overrides: {},
    edits: {},
};

/**
 * PBX-поля: метаданные редактируемых полей портала + optimistic-значения
 * и статусы inline-сейвов. Значения-правда живут в DTO отчётов (finance);
 * overrides — тонкий слой поверх них до перезагрузки отчёта.
 */
const pbxFieldsSlice = createSlice({
    name: 'pbxFields',
    initialState,
    reducers: {
        metaLoading: (state: PbxFieldsState) => {
            state.meta.status = 'loading';
        },
        metaReady: (
            state: PbxFieldsState,
            action: PayloadAction<PbxFieldMeta[]>,
        ) => {
            state.meta.status = 'ready';
            state.meta.byCode = Object.fromEntries(
                action.payload.map(field => [field.code, field]),
            );
        },
        metaError: (state: PbxFieldsState) => {
            state.meta.status = 'error';
        },
        setOverride: (
            state: PbxFieldsState,
            action: PayloadAction<{
                key: PbxEditKey;
                value: string | null;
            }>,
        ) => {
            state.overrides[action.payload.key] = {
                value: action.payload.value,
            };
        },
        setEdit: (
            state: PbxFieldsState,
            action: PayloadAction<{
                key: PbxEditKey;
                edit: PbxFieldEditState;
            }>,
        ) => {
            state.edits[action.payload.key] = action.payload.edit;
        },
        clearEdit: (
            state: PbxFieldsState,
            action: PayloadAction<{ key: PbxEditKey }>,
        ) => {
            delete state.edits[action.payload.key];
        },
    },
});

export const pbxFieldsReducer = pbxFieldsSlice.reducer;
export const pbxFieldsActions = pbxFieldsSlice.actions;
