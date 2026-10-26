import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { ClientTypeCode } from '../lib/client-type-view';

/** Тип клиента у сделки и компании — как его вернул бэк. */
export interface ClientTypeSides {
    deal: ClientTypeCode | null;
    company: ClientTypeCode | null;
}

/**
 * Состояние «Типа клиента» в шапке.
 *
 * saved — значения после записи или выравнивания в этой сессии: сущности в
 * app.bitrix после записи не перечитываются, и без оверрайда шапка
 * показывала бы старое значение до перезагрузки.
 */
export interface ClientTypeState {
    saved: ClientTypeSides | null;
    isSaving: boolean;
    error: string | null;
}

const initialState: ClientTypeState = {
    saved: null,
    isSaving: false,
    error: null,
};

const clientTypeSlice = createSlice({
    name: 'clientType',
    initialState,
    reducers: {
        /** Полный сброс: reloadApp перечитывает тип из сущностей. */
        reset() {
            return initialState;
        },
        setSaving(state) {
            state.isSaving = true;
            state.error = null;
        },
        setSaved(state, action: PayloadAction<ClientTypeSides>) {
            state.saved = action.payload;
            state.isSaving = false;
        },
        setError(state, action: PayloadAction<{ message: string }>) {
            state.error = action.payload.message;
            state.isSaving = false;
        },
    },
});

/*
 * Экспорты аннотированы явно: инференс тащил immer-тип из pnpm-пути
 * (TS2742) — тот же приём, что в InnSlice.
 */
export const clientTypeActions: {
    reset: ActionCreatorWithoutPayload<'clientType/reset'>;
    setSaving: ActionCreatorWithoutPayload<'clientType/setSaving'>;
    setSaved: ActionCreatorWithPayload<ClientTypeSides, 'clientType/setSaved'>;
    setError: ActionCreatorWithPayload<
        { message: string },
        'clientType/setError'
    >;
} = clientTypeSlice.actions;

export const clientTypeReducer: Reducer<ClientTypeState> =
    clientTypeSlice.reducer;
