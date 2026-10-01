import {
    createSlice,
    type ActionCreatorWithoutPayload,
    type ActionCreatorWithPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import { duplicatesActions } from './DuplicatesSlice';
import type { MergeCardsResult, MergeCardsStatus } from './index';

export interface MergeCardsState {
    status: MergeCardsStatus;
    error: string | null;
    /** Ссылки, по которым строился план, — с ними же и слияние. */
    entityRefs: string[];
    /** План пробного прогона (с подписью planHash). */
    plan: MergeCardsResult | null;
    /** Итог слияния. */
    result: MergeCardsResult | null;
}

const initialState: MergeCardsState = {
    status: 'idle',
    error: null,
    entityRefs: [],
    plan: null,
    result: null,
};

/**
 * «Объединить карточки» в окне кандидата. Отдельный слайс, чтобы не
 * раздувать ленту дублей; сбрасывается при открытии и закрытии окна —
 * план чужого кандидата не должен «доехать» до следующего.
 */
const mergeCardsSlice = createSlice({
    name: 'duplicatesMerge',
    initialState,
    reducers: {
        planStarted(state, action: PayloadAction<{ entityRefs: string[] }>) {
            state.status = 'planning';
            state.error = null;
            state.entityRefs = action.payload.entityRefs;
            state.plan = null;
            state.result = null;
        },
        planned(state, action: PayloadAction<{ plan: MergeCardsResult }>) {
            state.status = 'planned';
            state.plan = action.payload.plan;
        },
        mergeStarted(state) {
            state.status = 'merging';
            state.error = null;
        },
        merged(state, action: PayloadAction<{ result: MergeCardsResult }>) {
            state.status = 'done';
            state.result = action.payload.result;
        },
        failed(state, action: PayloadAction<{ message: string }>) {
            state.status = 'error';
            state.error = action.payload.message;
        },
        cancelled: () => initialState,
    },
    extraReducers: builder => {
        builder
            .addCase(duplicatesActions.detailsOpened, () => initialState)
            .addCase(duplicatesActions.detailsClosed, () => initialState);
    },
});

/*
 * Экспорты аннотированы явно: инференс тащил immer-тип из pnpm-пути
 * (TS2742) — тот же приём, что в InnSlice.
 */
export const mergeCardsActions: {
    planStarted: ActionCreatorWithPayload<
        { entityRefs: string[] },
        'duplicatesMerge/planStarted'
    >;
    planned: ActionCreatorWithPayload<
        { plan: MergeCardsResult },
        'duplicatesMerge/planned'
    >;
    mergeStarted: ActionCreatorWithoutPayload<'duplicatesMerge/mergeStarted'>;
    merged: ActionCreatorWithPayload<
        { result: MergeCardsResult },
        'duplicatesMerge/merged'
    >;
    failed: ActionCreatorWithPayload<
        { message: string },
        'duplicatesMerge/failed'
    >;
    cancelled: ActionCreatorWithoutPayload<'duplicatesMerge/cancelled'>;
} = mergeCardsSlice.actions;

export const mergeCardsReducer: Reducer<MergeCardsState> =
    mergeCardsSlice.reducer;
