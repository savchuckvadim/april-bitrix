import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type HeadModeStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface HeadModeState {
    /** Загрузка списка подчинённых: ready и error — оба «дождались». */
    status: HeadModeStatus;
    /** Сотрудники, чьи дела видит руководитель; пусто — не руководитель. */
    subordinateIds: number[];
    /** Суперпользователь April: права руководителя (кнопки в дублях). */
    isSuperUser: boolean;
    /** Режим включён тумблером (по умолчанию включён). */
    enabled: boolean;
}

const initialState: HeadModeState = {
    status: 'idle',
    subordinateIds: [],
    isSuperUser: false,
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
            action: PayloadAction<{
                subordinateIds: number[];
                isSuperUser: boolean;
            }>,
        ) => {
            state.status = 'ready';
            state.subordinateIds = action.payload.subordinateIds;
            state.isSuperUser = action.payload.isSuperUser;
        },
        /** Список не получен — работаем как обычный менеджер. */
        setFailed: (state: HeadModeState) => {
            state.status = 'error';
            state.subordinateIds = [];
            state.isSuperUser = false;
        },
        setEnabled: (
            state: HeadModeState,
            action: PayloadAction<{ enabled: boolean }>,
        ) => {
            state.enabled = action.payload.enabled;
        },
        /**
         * Сменился пользователь приложения («работать как»): список
         * подчинённых — чужой, следующий бут обязан перечитать его.
         * Выбор тумблера остаётся.
         */
        resetPerimeter: (state: HeadModeState) => {
            state.status = 'idle';
            state.subordinateIds = [];
            state.isSuperUser = false;
        },
    },
});

export const headModeReducer = headModeSlice.reducer;
export const headModeActions = headModeSlice.actions;
