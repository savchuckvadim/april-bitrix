import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type {
    LeadRequestCard,
    LeadNotCaTypeCode,
    LeadRequestUpdate,
} from './index';

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
    /**
     * Окно заявки открыто и владеет слотом карточки. Слот один на
     * приложение, а желающих писать в него трое (гейт очереди, иконка,
     * панель окна) — без замка они перетирали друг друга, и правки
     * уезжали не тому лиду. Пока замок стоит, гейт не фетчит, не
     * двигает очередь и не показывается.
     */
    isHeldByDialog: boolean;
    /**
     * Окно карточки открыто. Живёт в сторе, а не в компоненте: открыть его
     * могут и иконка привязок в пульте, и миниатюра заявки в отчёте — окно
     * при этом должно быть одно.
     */
    isDialogOpen: boolean;
    /**
     * Оверрайд битриксовской стадии (STATUS_ID) после смены из панели:
     * полоска обновляется сразу, не дожидаясь перечитки графа связей
     * (паттерн addedPhones/addedEmails из ClientSignals).
     */
    bitrixStageById: Record<number, string>;
    /**
     * Отложенная правка «Не ЦА»: ждём тип, без него портал её не примет.
     * null — окно закрыто.
     */
    notCaPrompt: Partial<LeadRequestUpdate> | null;
}

const initialState: LeadRequestState = {
    leadId: null,
    card: null,
    status: 'idle',
    saving: false,
    error: null,
    finalSync: { notCaTypeCode: null, note: '' },
    isHeldByDialog: false,
    isDialogOpen: false,
    bitrixStageById: {},
    notCaPrompt: null,
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
        setHeldByDialog(state, action: PayloadAction<boolean>) {
            state.isHeldByDialog = action.payload;
        },
        /** Открыть/закрыть окно карточки; замок слота ставится заодно. */
        setDialogOpen(state, action: PayloadAction<boolean>) {
            state.isDialogOpen = action.payload;
            state.isHeldByDialog = action.payload;
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
        /** Придержать правку и спросить тип «не ЦА». */
        askNotCaType(
            state,
            action: PayloadAction<Partial<LeadRequestUpdate>>,
        ) {
            state.notCaPrompt = action.payload;
        },
        closeNotCaPrompt(state) {
            state.notCaPrompt = null;
        },
        setBitrixStage(
            state,
            action: PayloadAction<{ leadId: number; statusId: string }>,
        ) {
            state.bitrixStageById[action.payload.leadId] =
                action.payload.statusId;
        },
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const leadRequestActions: {
    setLoading: ActionCreatorWithPayload<number, 'leadRequest/setLoading'>;
    setHeldByDialog: ActionCreatorWithPayload<
        boolean,
        'leadRequest/setHeldByDialog'
    >;
    setDialogOpen: ActionCreatorWithPayload<
        boolean,
        'leadRequest/setDialogOpen'
    >;
    setCard: ActionCreatorWithPayload<LeadRequestCard, 'leadRequest/setCard'>;
    setError: ActionCreatorWithPayload<string, 'leadRequest/setError'>;
    setSaving: ActionCreatorWithPayload<boolean, 'leadRequest/setSaving'>;
    setNotCaTypeCode: ActionCreatorWithPayload<
        LeadNotCaTypeCode | null,
        'leadRequest/setNotCaTypeCode'
    >;
    setSyncNote: ActionCreatorWithPayload<string, 'leadRequest/setSyncNote'>;
    askNotCaType: ActionCreatorWithPayload<
        Partial<LeadRequestUpdate>,
        'leadRequest/askNotCaType'
    >;
    closeNotCaPrompt: ActionCreatorWithoutPayload<'leadRequest/closeNotCaPrompt'>;
    setBitrixStage: ActionCreatorWithPayload<
        { leadId: number; statusId: string },
        'leadRequest/setBitrixStage'
    >;
    reset: ActionCreatorWithoutPayload<'leadRequest/reset'>;
} = leadRequestSlice.actions;

export const leadRequestReducer: Reducer<LeadRequestState> =
    leadRequestSlice.reducer;
