import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { TakeoverPreview } from './types';

export type ClientTakeoverStatus = 'idle' | 'loading' | 'ready';

export interface ClientTakeoverState {
    /** Окно «Забрать работу коллег себе?» открыто. */
    isOpen: boolean;
    /** Отправка ждёт ответа окна. */
    pendingSend: boolean;
    status: ClientTakeoverStatus;
    preview: TakeoverPreview | null;
    /** Вопрос закрыт для текущего отчёта — отправка больше не перехватывается. */
    resolved: boolean;
    /**
     * Ответ менеджера: true — «Забрать себе», false — «Не забирать»,
     * null — не спрашивали (перехват выключен, чужой работы нет, сбой).
     * Уезжает в EventSalesFlowDto.takeoverConfirmed.
     */
    confirmed: boolean | null;
}

const initialState: ClientTakeoverState = {
    isOpen: false,
    pendingSend: false,
    status: 'idle',
    preview: null,
    resolved: false,
    confirmed: null,
};

/**
 * Перехват клиента (настройки портала report_takeover_*): вопрос перед
 * отправкой, если отчёт заберёт или закроет работу коллег.
 */
const clientTakeoverSlice = createSlice({
    name: 'clientTakeover',
    initialState,
    reducers: {
        opened(state) {
            state.pendingSend = true;
            state.status = 'loading';
        },
        previewLoaded(state, action: PayloadAction<TakeoverPreview>) {
            state.preview = action.payload;
            state.status = 'ready';
            state.isOpen = true;
        },
        resolvedAndClosed(state, action: PayloadAction<boolean | null>) {
            state.confirmed = action.payload;
            state.resolved = true;
            state.isOpen = false;
            state.pendingSend = false;
        },
        closed(state) {
            state.isOpen = false;
            state.pendingSend = false;
        },
        resetForNewEvent: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const clientTakeoverActions: {
    opened: ActionCreatorWithoutPayload<'clientTakeover/opened'>;
    previewLoaded: ActionCreatorWithPayload<
        TakeoverPreview,
        'clientTakeover/previewLoaded'
    >;
    resolvedAndClosed: ActionCreatorWithPayload<
        boolean | null,
        'clientTakeover/resolvedAndClosed'
    >;
    closed: ActionCreatorWithoutPayload<'clientTakeover/closed'>;
    resetForNewEvent: ActionCreatorWithoutPayload<'clientTakeover/resetForNewEvent'>;
} = clientTakeoverSlice.actions;

export const clientTakeoverReducer: Reducer<ClientTakeoverState> =
    clientTakeoverSlice.reducer;
