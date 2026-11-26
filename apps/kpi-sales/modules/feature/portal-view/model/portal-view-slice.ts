import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultPortalViewSettings } from '../consts/portal-view.consts';
import type {
    PortalViewOptions,
    PortalViewResponse,
    PortalViewSettings,
} from './types';

export interface PortalViewState {
    /** Загрузка отработала (успехом или сбоем): до этого страница настроек показывает скелет. */
    loaded: boolean;
    /** Настройки не удалось загрузить — действуют безопасные значения по умолчанию. */
    loadFailed: boolean;
    view: PortalViewSettings;
    /** Пользователь может менять настройки (по ответу бэка; в «Смотреть как…» его гасит хук). */
    canEdit: boolean;
    supportUrl: string | null;
    /** Справочники формы; null — ответа ещё не было. */
    options: PortalViewOptions | null;
    saving: boolean;
    /** Понятный текст ошибки последнего сохранения. */
    error: string | null;
}

const createInitialState = (): PortalViewState => ({
    loaded: false,
    loadFailed: false,
    view: defaultPortalViewSettings(),
    canEdit: false,
    supportUrl: null,
    options: null,
    saving: false,
    error: null,
});

/** Ответ бэка целиком заменяет настройки (после чтения и после сохранения). */
const applyResponse = (state: PortalViewState, response: PortalViewResponse) => {
    state.loaded = true;
    state.loadFailed = false;
    state.view = response.view;
    state.canEdit = response.canEdit;
    state.supportUrl = response.supportUrl;
    state.options = response.options;
};

/**
 * Портальные настройки вида отчёта: скрытые вкладки, графики, главные
 * бейджи, ссылка на поддержку. Пока бэк не ответил (или ответил ошибкой) —
 * ничего не скрыто, графики включены, лишних кнопок нет.
 */
const portalViewSlice = createSlice({
    name: 'portalView',
    initialState: createInitialState(),
    reducers: {
        /** Новая загрузка (другой портал/пользователь): прежнее забываем. */
        loadStarted: (state: PortalViewState) => {
            Object.assign(state, createInitialState());
        },
        loaded: (
            state: PortalViewState,
            action: PayloadAction<PortalViewResponse>,
        ) => {
            applyResponse(state, action.payload);
        },
        loadFailed: (state: PortalViewState) => {
            state.loaded = true;
            state.loadFailed = true;
        },
        saveStarted: (state: PortalViewState) => {
            state.saving = true;
            state.error = null;
        },
        saved: (
            state: PortalViewState,
            action: PayloadAction<PortalViewResponse>,
        ) => {
            applyResponse(state, action.payload);
            state.saving = false;
            state.error = null;
        },
        saveFailed: (state: PortalViewState, action: PayloadAction<string>) => {
            state.saving = false;
            state.error = action.payload;
        },
        clearError: (state: PortalViewState) => {
            state.error = null;
        },
        /**
         * Публичная страница: свои названия показателей портала из ответа
         * ссылки (настройки вида там не грузятся). Остальное не трогается.
         */
        publicLabelsApplied: (
            state: PortalViewState,
            action: PayloadAction<Record<string, string>>,
        ) => {
            state.view.labels = action.payload;
        },
    },
});

export const portalViewReducer = portalViewSlice.reducer;
export const portalViewActions = portalViewSlice.actions;
