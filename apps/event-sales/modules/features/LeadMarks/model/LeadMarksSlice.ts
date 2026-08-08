import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { LeadMark } from '../lib/lead-marks-view';

/**
 * Пометки лидов/заявок клиента: статус заявки, тип «не ЦА», атрибуция
 * продажи. Грузятся отдельно от связей клиента: duplicates/details отдаёт
 * лиды без UF-полей, а пометки живут именно в них.
 */
export interface LeadMarksState {
    byId: Record<number, LeadMark>;
    /** id лидов, по которым идёт запись — блокируют свои контролы. */
    savingIds: number[];
    status: 'idle' | 'loading' | 'ready' | 'error';
}

const initialState: LeadMarksState = {
    byId: {},
    savingIds: [],
    status: 'idle',
};

const leadMarksSlice = createSlice({
    name: 'leadMarks',
    initialState,
    reducers: {
        /** Полный сброс: reloadApp перезапрашивает пометки заново. */
        reset() {
            return initialState;
        },
        fetchStarted(state) {
            state.status = 'loading';
        },
        fetchSucceeded(state, action: PayloadAction<{ marks: LeadMark[] }>) {
            for (const mark of action.payload.marks) {
                state.byId[mark.id] = mark;
            }
            state.status = 'ready';
        },
        fetchFailed(state) {
            state.status = 'error';
        },
        savingStarted(state, action: PayloadAction<{ leadId: number }>) {
            state.savingIds.push(action.payload.leadId);
        },
        savingFinished(state, action: PayloadAction<{ leadId: number }>) {
            state.savingIds = state.savingIds.filter(
                id => id !== action.payload.leadId,
            );
        },
        markPatched(
            state,
            action: PayloadAction<{ leadId: number; patch: Partial<LeadMark> }>,
        ) {
            const current = state.byId[action.payload.leadId];
            if (current) {
                state.byId[action.payload.leadId] = {
                    ...current,
                    ...action.payload.patch,
                };
            }
        },
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const leadMarksActions: {
    reset: ActionCreatorWithoutPayload<'leadMarks/reset'>;
    fetchStarted: ActionCreatorWithoutPayload<'leadMarks/fetchStarted'>;
    fetchSucceeded: ActionCreatorWithPayload<
        { marks: LeadMark[] },
        'leadMarks/fetchSucceeded'
    >;
    fetchFailed: ActionCreatorWithoutPayload<'leadMarks/fetchFailed'>;
    savingStarted: ActionCreatorWithPayload<
        { leadId: number },
        'leadMarks/savingStarted'
    >;
    savingFinished: ActionCreatorWithPayload<
        { leadId: number },
        'leadMarks/savingFinished'
    >;
    markPatched: ActionCreatorWithPayload<
        { leadId: number; patch: Partial<LeadMark> },
        'leadMarks/markPatched'
    >;
} = leadMarksSlice.actions as never;

export const leadMarksReducer: Reducer<LeadMarksState> =
    leadMarksSlice.reducer;
