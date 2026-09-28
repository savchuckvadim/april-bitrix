import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type HeadModeStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface HeadModeState {
    /** Загрузка списка подчинённых: ready и error — оба «дождались». */
    status: HeadModeStatus;
    /** Сотрудники, чьи дела видит руководитель; пусто — не руководитель. */
    subordinateIds: number[];
    /** Режим включён тумблером (по умолчанию включён). */
    enabled: boolean;
}

const initialState: HeadModeState = {
    status: 'idle',
    subordinateIds: [],
    enabled: true,
};

/**
 * Режим руководителя. В reload-reset НЕ входит: состав подчинённых
 * перезагрузкой карточки не меняется, а сброс дал бы окно, в котором дела
 * сотрудников исчезают из списка.
 */
const headModeSlice = createSlice({
    name: 'headMode',
    initialState,
    reducers: {
        setLoading: (state: HeadModeState) => {
            state.status = 'loading';
        },
        setFetched: (
            state: HeadModeState,
            action: PayloadAction<{ subordinateIds: number[] }>,
        ) => {
            state.status = 'ready';
            state.subordinateIds = action.payload.subordinateIds;
        },
        /** Список не получен — работаем как обычный менеджер. */
        setFailed: (state: HeadModeState) => {
            state.status = 'error';
            state.subordinateIds = [];
        },
        setEnabled: (
            state: HeadModeState,
            action: PayloadAction<{ enabled: boolean }>,
        ) => {
            state.enabled = action.payload.enabled;
        },
    },
});

export const headModeReducer = headModeSlice.reducer;
export const headModeActions = headModeSlice.actions;
