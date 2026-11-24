import { createSlice } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/AppSlice';

/**
 * Автоопределение типа клиента по реквизитам: ждёт загрузки (`idle`), идёт
 * (`running`), завершено (`done`). Одна попытка на загрузку сделки.
 */
export type ClientTypeDetectStatus = 'idle' | 'running' | 'done';

export interface ClientTypePromptState {
    detect: ClientTypeDetectStatus;
    /** «Позже»: окно скрыто до перезагрузки страницы, в localStorage не пишется. */
    deferred: boolean;
}

const initialState: ClientTypePromptState = {
    detect: 'idle',
    deferred: false,
};

export const clientTypePromptSlice = createSlice({
    name: 'clientTypePrompt',
    initialState,
    reducers: {
        detectStarted(state: ClientTypePromptState) {
            state.detect = 'running';
        },
        detectFinished(state: ClientTypePromptState) {
            state.detect = 'done';
        },
        /** Менеджер нажал «Позже» (или закрыл окно). */
        deferred(state: ClientTypePromptState) {
            state.deferred = true;
        },
    },
    extraReducers: builder => {
        // сделка загружена заново (вход, ⟳): реквизиты и тип клиента определяем снова;
        // «Позже» переживает ⟳, сбрасывает его только перезагрузка страницы
        builder.addCase(
            appActions.setAppData,
            (state: ClientTypePromptState) => {
                state.detect = 'idle';
            },
        );
    },
});

export const clientTypePromptActions = clientTypePromptSlice.actions;
export const clientTypePromptReducer = clientTypePromptSlice.reducer;
