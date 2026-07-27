import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiSettingsState {
    /**
     * Гидратация настроек прошла (localStorage/бэк применены) —
     * до этого автосохранение запрещено, иначе дефолты затрут блоб.
     */
    hydrated: boolean;
    /** Счётчик изменений не-Redux хранилищ (блоки, выборы графиков). */
    touchCount: number;
}

const initialState: UiSettingsState = {
    hydrated: false,
    touchCount: 0,
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
    },
});

export const uiSettingsReducer = uiSettingsSlice.reducer;
export const uiSettingsActions = uiSettingsSlice.actions;
