import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sanitizeExtraBadges } from '../lib/ui-settings-calls-list';

export interface UiSettingsState {
    /**
     * Гидратация настроек прошла (localStorage/бэк применены) —
     * до этого автосохранение запрещено, иначе дефолты затрут блоб.
     */
    hydrated: boolean;
    /** Счётчик изменений не-Redux хранилищ (блоки, выборы графиков). */
    touchCount: number;
    /** «Разборы звонков»: бейджи и пункты методики, добавленные в панель (id). */
    callsListExtraBadges: string[];
}

const initialState: UiSettingsState = {
    hydrated: false,
    touchCount: 0,
    callsListExtraBadges: [],
};

const uiSettingsSlice = createSlice({
    name: 'uiSettings',
    initialState,
    reducers: {
        setHydrated: (state: UiSettingsState) => {
            state.hydrated = true;
        },
        /** Сигнал «локальная настройка изменилась» → триггер автосейва. */
        touched: (state: UiSettingsState, _action: PayloadAction<void>) => {
            state.touchCount += 1;
        },
        /** Пользователь изменил добавленные бейджи «Разборов звонков» → автосейв. */
        setCallsListExtraBadges: (
            state: UiSettingsState,
            action: PayloadAction<string[]>,
        ) => {
            state.callsListExtraBadges = sanitizeExtraBadges(action.payload);
        },
        /** Гидратация из ui-settings blob (без автосейва; значения могли протухнуть). */
        hydrateCallsListSettings: (
            state: UiSettingsState,
            action: PayloadAction<{ extraBadges?: unknown }>,
        ) => {
            state.callsListExtraBadges = sanitizeExtraBadges(
                action.payload.extraBadges,
            );
        },
    },
});

export const uiSettingsReducer = uiSettingsSlice.reducer;
export const uiSettingsActions = uiSettingsSlice.actions;
