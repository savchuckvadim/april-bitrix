import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    CheckPresentationItem,
    CheckPresentationValue,
} from '../type/check-presentation-type';

export type AfterPresentationState = typeof initialState;

export const initialState = {
    checkPresentation: {
        items: [] as CheckPresentationItem[],
        /** рабочая копия ответов (редактируется в форме), ключ — id поля */
        answers: {} as Record<string, CheckPresentationValue>,
        /** последний сохранённый снимок ответов (baseline для отмены) */
        committed: {} as Record<string, CheckPresentationValue>,
    },
    isActive: false as boolean,
    initialized: false as boolean,
    /** хвост подтверждён пользователем — готов к отправке */
    isConfirmed: false as boolean,
    /** модалка открыта как обязательный шаг перед отправкой события */
    pendingSend: false as boolean,
};

const afterPresentationSlice = createSlice({
    name: 'afterPresentation',
    initialState,
    reducers: {
        setInitialized: (
            state: AfterPresentationState,
            action: PayloadAction<{ items: CheckPresentationItem[] }>,
        ) => {
            state.checkPresentation.items = action.payload.items;
            state.initialized = true;
        },
        setAnswer: (
            state: AfterPresentationState,
            action: PayloadAction<{ id: string; value: CheckPresentationValue }>,
        ) => {
            state.checkPresentation.answers[action.payload.id] = action.payload.value;
        },
        setActiveStatus: (
            state: AfterPresentationState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isActive = action.payload.status;
        },
        /** зафиксировать текущие ответы как сохранённые (при успешном submit) */
        commitAnswers: (state: AfterPresentationState) => {
            state.checkPresentation.committed = { ...state.checkPresentation.answers };
        },
        /** откатить рабочие ответы к последнему сохранённому снимку (при отмене) */
        revertAnswers: (state: AfterPresentationState) => {
            state.checkPresentation.answers = { ...state.checkPresentation.committed };
        },
        setConfirmed: (
            state: AfterPresentationState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isConfirmed = action.payload.status;
        },
        setPendingSend: (
            state: AfterPresentationState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.pendingSend = action.payload.status;
        },
        /** сброс перед новым событием (items/initialized сохраняем — грузятся раз на портал) */
        resetForNewEvent: (state: AfterPresentationState) => {
            state.checkPresentation.answers = {};
            state.checkPresentation.committed = {};
            state.isConfirmed = false;
            state.pendingSend = false;
            state.isActive = false;
        },
    },
});

export const afterPresentationReducer = afterPresentationSlice.reducer;
export const afterPresentationActions = afterPresentationSlice.actions;
