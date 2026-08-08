import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';

/**
 * Состояние фичи ИНН: редактор в шапке + статус записи.
 *
 * savedValue — записанный в этой сессии ИНН: сущность в app.bitrix после
 * записи не перечитывается (для лида рефреша нет вовсе), и без оверрайда
 * предупреждение «ИНН не заполнен» вернулось бы сразу после сохранения.
 */
export interface InnState {
    isEditorOpen: boolean;
    isSaving: boolean;
    error: string | null;
    savedValue: string | null;
}

const initialState: InnState = {
    isEditorOpen: false,
    isSaving: false,
    error: null,
    savedValue: null,
};

const innSlice = createSlice({
    name: 'inn',
    initialState,
    reducers: {
        /** Полный сброс: reloadApp перечитывает ИНН из сущности. */
        reset() {
            return initialState;
        },
        setEditorOpen(state, action: PayloadAction<{ isOpen: boolean }>) {
            state.isEditorOpen = action.payload.isOpen;
            if (!action.payload.isOpen) state.error = null;
        },
        setSaving(state, action: PayloadAction<{ status: boolean }>) {
            state.isSaving = action.payload.status;
            if (action.payload.status) state.error = null;
        },
        setSaved(state, action: PayloadAction<{ value: string }>) {
            state.savedValue = action.payload.value;
            state.isSaving = false;
            state.isEditorOpen = false;
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

/*
 * Экспорты аннотированы явно: инференс тащил immer-тип из pnpm-пути
 * (TS2742) — тот же приём, что в TaskDealsSlice.
 */
export const innActions: {
    reset: ActionCreatorWithoutPayload<'inn/reset'>;
    setEditorOpen: ActionCreatorWithPayload<
        { isOpen: boolean },
        'inn/setEditorOpen'
    >;
    setSaving: ActionCreatorWithPayload<{ status: boolean }, 'inn/setSaving'>;
    setSaved: ActionCreatorWithPayload<{ value: string }, 'inn/setSaved'>;
    setError: ActionCreatorWithPayload<{ message: string }, 'inn/setError'>;
    clearError: ActionCreatorWithoutPayload<'inn/clearError'>;
} = innSlice.actions;

export const innReducer: Reducer<InnState> = innSlice.reducer;
