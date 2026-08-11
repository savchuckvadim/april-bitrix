import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { LeadRequestCard, LeadNotCaTypeCode } from './index';

export type LeadRequestStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface LeadRequestState {
    /** Лид, чья карточка показана (резолвится thunk'ом из контекста). */
    leadId: number | null;
    card: LeadRequestCard | null;
    status: LeadRequestStatus;
    /** Идёт сохранение правки карточки. */
    saving: boolean;
    error: string | null;
    /**
     * Финальный синк заявки для отчёта «отказ/продажа»: уезжает в
     * EventSalesFlowDto.leadSync (тип «не ЦА» испрашивается при отказе).
     */
    finalSync: {
        notCaTypeCode: LeadNotCaTypeCode | null;
        note: string;
    };
}

const initialState: LeadRequestState = {
    leadId: null,
    card: null,
    status: 'idle',
    saving: false,
    error: null,
    finalSync: { notCaTypeCode: null, note: '' },
};

/**
 * Карточка заявки/лида (интерфейс заявки в «Звонках»): данные с бэка
 * `GET /lead-request/card`, правки через `POST /lead-request/update`.
 */
const leadRequestSlice = createSlice({
    name: 'leadRequest',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<number>) {
            state.leadId = action.payload;
            state.status = 'loading';
            state.error = null;
        },
        setCard(state, action: PayloadAction<LeadRequestCard>) {
            state.card = action.payload;
            state.leadId = action.payload.leadId;
            state.status = 'ready';
            state.error = null;
        },
        setError(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
        setSaving(state, action: PayloadAction<boolean>) {
            state.saving = action.payload;
        },
        setNotCaTypeCode(
            state,
            action: PayloadAction<LeadNotCaTypeCode | null>,
        ) {
            state.finalSync.notCaTypeCode = action.payload;
        },
        setSyncNote(state, action: PayloadAction<string>) {
            state.finalSync.note = action.payload;
        },
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const leadRequestActions: {
    setLoading: ActionCreatorWithPayload<number, 'leadRequest/setLoading'>;
    setCard: ActionCreatorWithPayload<LeadRequestCard, 'leadRequest/setCard'>;
    setError: ActionCreatorWithPayload<string, 'leadRequest/setError'>;
    setSaving: ActionCreatorWithPayload<boolean, 'leadRequest/setSaving'>;
    setNotCaTypeCode: ActionCreatorWithPayload<
        LeadNotCaTypeCode | null,
        'leadRequest/setNotCaTypeCode'
    >;
    setSyncNote: ActionCreatorWithPayload<string, 'leadRequest/setSyncNote'>;
    reset: ActionCreatorWithoutPayload<'leadRequest/reset'>;
} = leadRequestSlice.actions;

export const leadRequestReducer: Reducer<LeadRequestState> =
    leadRequestSlice.reducer;
