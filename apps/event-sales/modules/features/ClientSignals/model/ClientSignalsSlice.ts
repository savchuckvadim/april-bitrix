import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { SignalKind } from '../lib/signal-validate';

/**
 * Состояние точек связи (телефон/email лида): какой редактор открыт + статус
 * записи. addedPhones/addedEmails — добавленные в этой сессии значения:
 * лид в состоянии после записи не перечитывается, без оверрайда добавленное
 * пропадало бы из контрола до перезагрузки.
 */
export interface ClientSignalsState {
    editor: SignalKind | null;
    isSaving: boolean;
    error: string | null;
    addedPhones: string[];
    addedEmails: string[];
}

const initialState: ClientSignalsState = {
    editor: null,
    isSaving: false,
    error: null,
    addedPhones: [],
    addedEmails: [],
};

const clientSignalsSlice = createSlice({
    name: 'clientSignals',
    initialState,
    reducers: {
        setEditor(state, action: PayloadAction<{ kind: SignalKind | null }>) {
            state.editor = action.payload.kind;
            state.error = null;
        },
        setSaving(state, action: PayloadAction<{ status: boolean }>) {
            state.isSaving = action.payload.status;
            if (action.payload.status) state.error = null;
        },
        setSaved(
            state,
            action: PayloadAction<{ kind: SignalKind; value: string }>,
        ) {
            if (action.payload.kind === 'phone') {
                state.addedPhones.push(action.payload.value);
            } else {
                state.addedEmails.push(action.payload.value);
            }
            state.isSaving = false;
            state.editor = null;
        },
        setError(state, action: PayloadAction<{ message: string }>) {
            state.error = action.payload.message;
            state.isSaving = false;
        },
        /** Пользователь правит ввод — старая ошибка больше не про его текст. */
        clearError(state) {
            state.error = null;
        },
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути), как в InnSlice. */
export const clientSignalsActions: {
    setEditor: ActionCreatorWithPayload<
        { kind: SignalKind | null },
        'clientSignals/setEditor'
    >;
    setSaving: ActionCreatorWithPayload<
        { status: boolean },
        'clientSignals/setSaving'
    >;
    setSaved: ActionCreatorWithPayload<
        { kind: SignalKind; value: string },
        'clientSignals/setSaved'
    >;
    setError: ActionCreatorWithPayload<
        { message: string },
        'clientSignals/setError'
    >;
    clearError: ActionCreatorWithoutPayload<'clientSignals/clearError'>;
} = clientSignalsSlice.actions;

export const clientSignalsReducer: Reducer<ClientSignalsState> =
    clientSignalsSlice.reducer;
