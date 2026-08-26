import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { StagePredictResult } from './index';

export type StagePredictStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Предикт стадии основной воронки: по нему активируются стадийные чек-листы
 * («Клиент на решении», «Продажа»). `requestKey` — сериализованный запрос:
 * совпал и статус ready — повторный fetch не нужен (кэш по ключу);
 * ответ на УСТАРЕВШИЙ ключ отбрасывается (latest-wins).
 */
export interface StagePredictState {
    status: StagePredictStatus;
    requestKey: string | null;
    result: StagePredictResult | null;
}

const initialState: StagePredictState = {
    status: 'idle',
    requestKey: null,
    result: null,
};

const stagePredictSlice = createSlice({
    name: 'stagePredict',
    initialState,
    reducers: {
        pending(state, action: PayloadAction<{ requestKey: string }>) {
            state.status = 'loading';
            state.requestKey = action.payload.requestKey;
        },
        fulfilled(
            state,
            action: PayloadAction<{
                requestKey: string;
                result: StagePredictResult;
            }>,
        ) {
            if (state.requestKey !== action.payload.requestKey) return;
            state.status = 'ready';
            state.result = action.payload.result;
        },
        failed(state, action: PayloadAction<{ requestKey: string }>) {
            if (state.requestKey !== action.payload.requestKey) return;
            // Ошибка не блокирует отправку: предикт — UX-хинт, сервер-гард
            // продажи всё равно проверит DTO.
            state.status = 'error';
            state.result = null;
        },
        /** Контекст не требует предикта (lead-only, настройки выключены). */
        cleared(state) {
            state.status = 'idle';
            state.requestKey = null;
            state.result = null;
        },
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const stagePredictActions: {
    pending: ActionCreatorWithPayload<
        { requestKey: string },
        'stagePredict/pending'
    >;
    fulfilled: ActionCreatorWithPayload<
        { requestKey: string; result: StagePredictResult },
        'stagePredict/fulfilled'
    >;
    failed: ActionCreatorWithPayload<
        { requestKey: string },
        'stagePredict/failed'
    >;
    cleared: ActionCreatorWithoutPayload<'stagePredict/cleared'>;
    reset: ActionCreatorWithoutPayload<'stagePredict/reset'>;
} = stagePredictSlice.actions;

export const stagePredictReducer: Reducer<StagePredictState> =
    stagePredictSlice.reducer;
