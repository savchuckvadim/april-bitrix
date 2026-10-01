import {
    createSlice,
    type ActionCreatorWithoutPayload,
    type ActionCreatorWithPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import {
    chooseMain,
    initialSelection,
    toggleSelected,
} from '../lib/client-work-selection';
import type {
    ClientWork,
    ClientWorkJoinStatus,
    ClientWorkJoinSummary,
    ClientWorkStatus,
} from './index';

export interface ClientWorkState {
    status: ClientWorkStatus;
    error: string | null;
    /** Сделка, для которой загружен список (смена сделки — новый список). */
    dealId: number | null;
    data: ClientWork | null;
    /** Выбранная руководителем основная. */
    mainDealId: number | null;
    /** Отмеченные к присоединению. */
    selectedIds: number[];
    join: {
        status: ClientWorkJoinStatus;
        error: string | null;
        summary: ClientWorkJoinSummary | null;
    };
}

const initialJoin = (): ClientWorkState['join'] => ({
    status: 'idle',
    error: null,
    summary: null,
});

const initialState: ClientWorkState = {
    status: 'idle',
    error: null,
    dealId: null,
    data: null,
    mainDealId: null,
    selectedIds: [],
    join: initialJoin(),
};

/**
 * «Открытые сделки по клиенту»: открытые сделки клиента и выбор руководителя. Только
 * чистые редьюсеры; правила выбора — в lib/client-work-selection.
 */
const clientWorkSlice = createSlice({
    name: 'clientWork',
    initialState,
    reducers: {
        loadStarted(state, action: PayloadAction<{ dealId: number }>) {
            state.status = 'loading';
            state.error = null;
            if (state.dealId !== action.payload.dealId) {
                state.data = null;
                state.join = initialJoin();
            }
            state.dealId = action.payload.dealId;
        },
        loadSucceeded(state, action: PayloadAction<{ data: ClientWork }>) {
            const { data } = action.payload;
            const selection = initialSelection(data);
            state.status = 'ready';
            state.data = data;
            state.mainDealId = selection.mainDealId;
            state.selectedIds = selection.selectedIds;
        },
        loadFailed(state, action: PayloadAction<{ message: string }>) {
            state.status = 'error';
            state.error = action.payload.message;
        },
        mainChosen(state, action: PayloadAction<{ dealId: number }>) {
            const next = chooseMain(
                { mainDealId: state.mainDealId, selectedIds: state.selectedIds },
                action.payload.dealId,
            );
            state.mainDealId = next.mainDealId;
            state.selectedIds = next.selectedIds;
            // Новый выбор снимает подтверждение и прошлый итог.
            if (state.join.status !== 'joining') state.join = initialJoin();
        },
        dealToggled(state, action: PayloadAction<{ dealId: number }>) {
            state.selectedIds = toggleSelected(
                state.selectedIds,
                action.payload.dealId,
                state.mainDealId,
            );
            // Новый выбор снимает подтверждение и прошлый итог.
            if (state.join.status !== 'joining') state.join = initialJoin();
        },
        joinArmed(state) {
            state.join = { ...initialJoin(), status: 'armed' };
        },
        joinDisarmed(state) {
            state.join = initialJoin();
        },
        joinStarted(state) {
            state.join = { ...initialJoin(), status: 'joining' };
        },
        joinSucceeded(
            state,
            action: PayloadAction<{ summary: ClientWorkJoinSummary }>,
        ) {
            state.join = {
                status: 'done',
                error: null,
                summary: action.payload.summary,
            };
        },
        joinFailed(state, action: PayloadAction<{ message: string }>) {
            state.join = {
                status: 'error',
                error: action.payload.message,
                summary: null,
            };
        },
    },
});

/*
 * Экспорты аннотированы явно: инференс тащил immer-тип из pnpm-пути
 * (TS2742) — тот же приём, что в InnSlice.
 */
export const clientWorkActions: {
    loadStarted: ActionCreatorWithPayload<
        { dealId: number },
        'clientWork/loadStarted'
    >;
    loadSucceeded: ActionCreatorWithPayload<
        { data: ClientWork },
        'clientWork/loadSucceeded'
    >;
    loadFailed: ActionCreatorWithPayload<
        { message: string },
        'clientWork/loadFailed'
    >;
    mainChosen: ActionCreatorWithPayload<
        { dealId: number },
        'clientWork/mainChosen'
    >;
    dealToggled: ActionCreatorWithPayload<
        { dealId: number },
        'clientWork/dealToggled'
    >;
    joinArmed: ActionCreatorWithoutPayload<'clientWork/joinArmed'>;
    joinDisarmed: ActionCreatorWithoutPayload<'clientWork/joinDisarmed'>;
    joinStarted: ActionCreatorWithoutPayload<'clientWork/joinStarted'>;
    joinSucceeded: ActionCreatorWithPayload<
        { summary: ClientWorkJoinSummary },
        'clientWork/joinSucceeded'
    >;
    joinFailed: ActionCreatorWithPayload<
        { message: string },
        'clientWork/joinFailed'
    >;
} = clientWorkSlice.actions;

export const clientWorkReducer: Reducer<ClientWorkState> =
    clientWorkSlice.reducer;
